import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ApiKeyAuthGuard } from './apikey-auth.guard';
import { AuthService } from '../auth.service';

@Injectable()
export class ApiKeyJwtAuthGuard extends AuthGuard('api-key-jwt') {
    constructor(
        private readonly apiKeyAuthService: AuthService,
        private readonly configService: ConfigService,
    ) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<any> {
        const request = context.switchToHttp().getRequest();

        const jwtToken = this.extractJwtToken(request);
        if (jwtToken) {
            const jwtAuthGuard = new JwtAuthGuard(this.configService);
            const jwtCheck = await jwtAuthGuard.canActivate(context);
            if (jwtCheck) {
                return true;
            }
        }

        const apiKeyAuthGuard = new ApiKeyAuthGuard(this.apiKeyAuthService, this.configService);
        const apiKeyCheck = await apiKeyAuthGuard.canActivate(context);
        if (apiKeyCheck) {
            request.user = null;
            return true;
        }

        return false
    }

    private extractJwtToken(request: any): string | null {
        const authHeader = request.headers['authorization'];

        if (!authHeader) {
            return null;
        }

        const [type, token] = authHeader.split(' ');

        if (type.toLowerCase() !== 'bearer') {
            return null;
        }

        return token;
    }
}
