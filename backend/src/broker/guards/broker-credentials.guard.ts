import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { BrokerService } from 'src/admin/broker/broker.service';

@Injectable()
export class BrokerCredentialsGuard implements CanActivate {
    constructor(
        @Inject(BrokerService) private brokerService: BrokerService
    ) { }

    /**
     * Credentials may arrive three ways, checked in this order:
     *
     *   1. request body        — how the four POST operations have always sent them
     *   2. request headers     — `x-broker-username` / `x-broker-password`
     *   3. query string        — `?username=&password=`
     *
     * Headers and query exist because GET requests carry no body. Headers are
     * the documented choice for GET: query strings end up in access logs and
     * browser history, so the password is better off out of the URL.
     */
    private extractCredentials(request: any): { username?: string, password?: string } {
        const body = request.body || {};

        if (body.username || body.password) {
            return { username: body.username, password: body.password };
        }

        const headers = request.headers || {};

        if (headers['x-broker-username'] || headers['x-broker-password']) {
            return {
                username: headers['x-broker-username'],
                password: headers['x-broker-password'],
            };
        }

        const query = request.query || {};

        return { username: query.username, password: query.password };
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const { username, password } = this.extractCredentials(request);

        if (!username || !password) {
            throw new UnauthorizedException('username and password are required');
        }

        const broker = await this.brokerService.findByUsername(username);

        if (!broker) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, broker.password_hash);

        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        if (broker.status !== 1) {
            throw new UnauthorizedException('Broker account is suspended');
        }

        request.broker = broker;

        return true;
    }
}
