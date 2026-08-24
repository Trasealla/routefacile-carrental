import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    const JWT_SECRET = configService.get<string>('JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  /**
   * Customer tokens carry only { email, sub }. Staff tokens (admin, counter,
   * kyc_officer, hr_*) additionally carry `type`, so its presence means a staff
   * token has been presented to a customer endpoint — reject it outright.
   *
   * Today that is already blocked because staff tokens are signed with
   * ADMIN_JWT_SECRET and would fail this strategy's signature check. This makes
   * the separation explicit rather than incidental: if the two secrets were ever
   * set to the same value, `sub` would silently be read as a CUSTOMER id, and
   * admin id 1 would act as customer id 1. Enforce the intent, not the accident.
   */
  async validate(payload: any) {
    if (payload?.type) {
      throw new UnauthorizedException('Staff tokens cannot be used on customer endpoints');
    }
    return { id: payload.sub, email: payload.email };
  }
}
