import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminJwtStrategy extends PassportStrategy(Strategy, 'admin-jwt') {
  constructor(private configService: ConfigService) {
    const JWT_SECRET = configService.get<string>('ADMIN_JWT_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  /**
   * Mirror of JwtStrategy: a staff token must carry `type`. A customer token has
   * no `type`, so without this check one would authenticate here and `sub` would
   * be read as an ADMIN id — a customer whose user id happened to match an admin
   * id would inherit that admin's privileges.
   */
  async validate(payload: any) {
    if (!payload?.type) {
      throw new UnauthorizedException('Customer tokens cannot be used on admin endpoints');
    }
    return { id: payload.sub, email: payload.email, type: payload.type };
  }
}
