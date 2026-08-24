import {
  Controller,
  Inject,
  Get,
  Request,
  UseGuards,
  Post,
  Body,
  Put,
  BadRequestException,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { ApiKeyJwtAuthGuard } from './guard/apikey-jwt-auth.gaurd';
import { UserService } from 'src/user/user.service';
import { ApiExcludeEndpoint, ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from './guard/apikey-auth.guard';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AdminAuthGuard } from './guard/admin-auth.guard';
import { AdminJwtAuthGuard } from './guard/admin-jwt-auth.guard';
import { LoginUserDto } from './dtos/login.user.dto';
import { AdminService } from 'src/admin/admin.service';
import * as bcrypt from 'bcrypt';
import { AdminPasswordChangedEvent } from 'src/event/events/admin.password.changed.event';

@ApiHeader({
  name: 'x-api-key',
  required: true,
  description: 'Api key',
})
@ApiTags('auth')
@UseGuards(ApiKeyAuthGuard)
@Controller()
export class AuthController {
  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(UserService) private userService: UserService,
    @Inject(AdminService) private adminService: AdminService,
    private readonly eventEmitter: EventEmitter2
  ) { }

  @ApiExcludeEndpoint()
  @Get('auth')
  getHello(): string {
    return 'hello ';
  }

  @UseGuards(LocalAuthGuard)
  @Post('user/login')
  async login(@Body() body: LoginUserDto, @Request() req) {
    return this.authService.login(req.user);
  }

  @ApiExcludeEndpoint()
  @UseGuards(JwtAuthGuard)
  @Get('auth/jwt')
  async jwt(@Request() req) {
    return req.user;
  }

  @ApiExcludeEndpoint()
  @UseGuards(ApiKeyJwtAuthGuard)
  @Get('auth/jwt2')
  async jwt2(@Request() req) {
    if (req.user) {
      return `Hello logged in user ${req.user.email}`;
    } else {
      return `Hello public user`;
    }
  }

  @ApiExcludeEndpoint()
  @UseGuards(AdminAuthGuard)
  @Post('admin/login')
  async loginAdmin(@Request() req) {
    return this.authService.loginAdmin(req.user);
  }

  @ApiExcludeEndpoint()
  @UseGuards(AdminJwtAuthGuard)
  @Get('admin/test')
  async testAdmin(@Request() req) {
    return req.user;
  }

  @ApiExcludeEndpoint()
  @UseGuards(AdminJwtAuthGuard)
  @Put('admin/change-password')
  async changeAdminPassword(@Request() req, @Body() body: { current_password: string; new_password: string }) {
    const { current_password, new_password } = body;

    if (!current_password || !new_password) {
      throw new BadRequestException('current_password and new_password are required');
    }

    if (new_password.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    const admin = await this.adminService.getOne({ id: req.user.id });
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }

    const isMatch = bcrypt.compareSync(current_password, admin.password);
    if (!isMatch) {
      throw new BadRequestException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result = await this.adminService.update({ id: admin.id }, {
      password: hashedPassword,
      must_reset_password: 0,
    });

    if (result.status === 'error') {
      throw new BadRequestException('Failed to update password');
    }

    this.eventEmitter.emit('admin.password.changed', new AdminPasswordChangedEvent(admin.id));

    return { error: false, message: 'Password changed successfully' };
  }
}
