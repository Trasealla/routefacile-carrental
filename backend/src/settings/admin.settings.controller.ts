import { Body, Controller, Get, Inject, Put, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { SettingsService, SETTING_DEFAULTS } from './settings.service';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/settings')
export class AdminSettingsController {
  constructor(@Inject(SettingsService) private settings: SettingsService) { }

  /** Every known switch, with its stored (or default) value. */
  @Get()
  async list() {
    const rows = await this.settings.all();
    const byKey = new Map(rows.map((r) => [r.key_name, r]));

    const data = Object.keys(SETTING_DEFAULTS).map((key) => {
      const row = byKey.get(key);
      return {
        key_name: key,
        value: row ? row.value : SETTING_DEFAULTS[key],
        enabled: (row ? row.value : SETTING_DEFAULTS[key]) === '1',
        description: row?.description ?? DESCRIPTIONS[key] ?? null,
        updated_at: row?.updated_at ?? null,
      };
    });

    return { status: 'success', data };
  }

  @Put()
  async update(@Body() body: { key_name: string; value: string | boolean }, @Request() req) {
    const key = body?.key_name;
    if (!key || !(key in SETTING_DEFAULTS)) {
      return { status: 'error', message: 'Unknown setting key' };
    }
    const value =
      typeof body.value === 'boolean' ? (body.value ? '1' : '0') : String(body.value);

    await this.settings.set(key, value, req?.user?.id);
    return { status: 'success', message: 'Setting updated' };
  }
}

const DESCRIPTIONS: Record<string, string> = {
  pay_now_enabled:
    'Show the "Pay Now" option to customers. Keep this off until the CMI payment gateway is live — with it off, customers can only choose "Pay Later".',
  eur_rate:
    'How many dirhams to one euro. Prices are charged in MAD; the € figure shown beside them is calculated with this rate (10 means 700 MAD is shown as €70).',
};
