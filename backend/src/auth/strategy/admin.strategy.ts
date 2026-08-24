import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AdminStrategy extends PassportStrategy(Strategy, 'admin') {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<any> {
    const admin = await this.authService.validateAdmin(email, password);
    if (!admin) {
      throw new UnauthorizedException('Wrong credentials');
    }
    if (admin.status === AdminService.INACTIVE) {
      throw new UnprocessableEntityException('Admin is not active');
    }
    return admin;
  }
}
