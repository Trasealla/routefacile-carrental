import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ThrottlerGuard, Throttle } from '@nestjs/throttler';
import { MemoPortalAuthService } from './memo.portal.auth.service';
import { MemoPortalUserService } from './memo.portal.user.service';
import { PortalJwtAuthGuard } from 'src/auth/guard/portal-jwt-auth.guard';

@ApiExcludeController()
@Controller('memo-portal/auth')
export class MemoPortalAuthController {
  constructor(
    private readonly authService: MemoPortalAuthService,
    private readonly userService: MemoPortalUserService,
  ) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('request-pin')
  async requestPin(@Body() body: { email: string }, @Request() req) {
    return this.authService.requestPin(body?.email, req.ip);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('verify-pin')
  async verifyPin(@Body() body: { email: string; pin: string }) {
    return this.authService.verifyPin(body?.email, body?.pin);
  }

  @UseGuards(PortalJwtAuthGuard)
  @Post('logout')
  async logout() {
    // Stateless JWT — client just discards the token.
    return { success: true };
  }

  @UseGuards(PortalJwtAuthGuard)
  @Get('/me')
  async me(@Request() req) {
    const user = await this.userService.findByEmail(req.user.email);
    if (!user) return { id: req.user.id, email: req.user.email };
    return {
      id: user.id,
      email: user.email,
      first_login_at: user.first_login_at,
      last_login_at: user.last_login_at,
    };
  }
}
