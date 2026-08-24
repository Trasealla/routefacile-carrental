import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';
import { AdminService } from 'src/admin/admin.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(UserService) private userService: UserService,
    @Inject(AdminService) private adminService: AdminService

  ) { }

  validateApiKey(api_key: string) {
    const generalApiKey = this.configService.get<string>('API_KEY');
    const tsdApiKey = this.configService.get<string>('TSD_API_KEY');
    const mobileApiKey = this.configService.get<string>('MOBILE_API_KEY');

    // Accept general API key, TSD key (Auto Europe), or mobile app key
    const validKeys = [generalApiKey, tsdApiKey, mobileApiKey].filter(Boolean);
    return validKeys.includes(api_key);
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userService.getOne({ email: email });
    if (user) {
      // If password is empty/undefined (mobile app login), allow login if user is active
      if (!pass || pass === '') {
        if (user.status === 1) {
          const { password, ...result } = user;
          return result;
        }
        return null;
      }
      const isMatch = await bcrypt.compare(pass, user.password);
      if (isMatch) {
        const { password, ...result } = user;
        return result;
      }
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };
    await this.userService.update({ email: user.email }, { last_login_at: new Date() });
    return {
      access_token: this.jwtService.sign(payload),
      user_id: user.id
    };
  }

  async validateAdmin(email: string, password: string): Promise<any> {
    const admin = await this.adminService.getOne({ email });
    if (admin && bcrypt.compareSync(password, admin.password)) {
      return admin;
    }
    return null;
  }

  async loginAdmin(admin: any) {
    const payload = { email: admin.email, sub: admin.id, type: admin.type };
    await this.adminService.update({ id: admin.id }, { last_login_at: new Date() });
    return {
      access_token: this.jwtService.sign(payload, { secret: this.configService.get<string>('ADMIN_JWT_SECRET') }),
      type: admin.type,
      must_reset_password: admin.must_reset_password === 1,
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        email: admin.email,
        type: admin.type,
      },
    };
  }
}
