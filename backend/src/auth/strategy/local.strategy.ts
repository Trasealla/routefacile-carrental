import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private authService: AuthService,
    @Inject(UserService) private userService: UserService
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(email, password || '');
    if (!user) {
      throw new UnauthorizedException('Wrong credentials');
    }
    // Auto-activate inactive users on login
    if (user.status === UserService.INACTIVE) {
      await this.userService.update({ id: user.id }, { status: UserService.ACTIVE, register_otp: null });
      user.status = UserService.ACTIVE;
    }
    return user;
  }
}
