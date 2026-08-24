import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy, 'api-key') {
  constructor(private authService: AuthService, private configService: ConfigService) {
    const headerKeyApiKey = configService.get<string>('HEADER_KEY_API_KEY') || 'x-api-key';

    super({ header: headerKeyApiKey, prefix: '' }, false, async (apiKey: string, done: Function) => {
      const isValid = this.authService.validateApiKey(apiKey);
      if (isValid) {
        return done(null, true);
      }
      return done(new UnauthorizedException('Invalid API key'), null);
    });
  }
}
