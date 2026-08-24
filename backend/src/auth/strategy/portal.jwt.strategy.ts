import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PortalJwtStrategy extends PassportStrategy(Strategy, 'portal-jwt') {
  constructor(private configService: ConfigService) {
    const JWT_SECRET =
      configService.get<string>('PORTAL_JWT_SECRET') ||
      configService.get<string>('ADMIN_JWT_SECRET');
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: any) {
    if (payload?.scope !== 'portal') {
      throw new UnauthorizedException('Invalid token scope');
    }
    return { id: payload.sub, email: payload.email, scope: payload.scope };
  }
}
