import { BadRequestException, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  constructor(private authService: AuthService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { email, password } = request.body;

    // If no password provided (mobile app login), handle directly
    if (!password || password === '') {
      if (!email) {
        throw new BadRequestException('Email is required');
      }
      const user = await this.authService.validateUser(email, '');
      if (!user) {
        throw new UnauthorizedException('User not found or inactive');
      }
      request.user = user;
      return true;
    }

    // Normal login with password — use passport-local
    return super.canActivate(context) as Promise<boolean>;
  }
}
