import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { SettingsService } from './settings.service';

@ApiHeader({ name: 'x-api-key', required: true, description: 'Api key' })
@ApiTags('settings')
@UseGuards(ApiKeyAuthGuard)
@Controller('settings')
export class SettingsPublicController {
  constructor(@Inject(SettingsService) private settings: SettingsService) { }

  /** Runtime switches the storefront needs, e.g. { pay_now_enabled: false } */
  @Get('public')
  async publicSettings() {
    return this.settings.publicMap();
  }
}
