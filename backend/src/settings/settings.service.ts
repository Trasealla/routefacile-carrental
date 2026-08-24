import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppSetting } from 'src/entities/app.setting.entity';

/**
 * Defaults used when a key has never been written to the table. Keeping them
 * here means a missing row can never turn a payment option on by accident.
 */
export const SETTING_DEFAULTS: Record<string, string> = {
  pay_now_enabled: '0', // CMI is not live yet — Pay Now stays hidden
  // Prices are quoted in MAD; the EUR figure shown next to them is derived.
  // 10 is the client's own working rate (700 MAD = 70 EUR, 900 = 90).
  eur_rate: '10',
};

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(AppSetting) private repo: Repository<AppSetting>,
  ) { }

  async all(): Promise<AppSetting[]> {
    return this.repo.find({ order: { key_name: 'ASC' } });
  }

  async get(key: string): Promise<string> {
    const row = await this.repo.findOne({ where: { key_name: key } });
    return row ? row.value : (SETTING_DEFAULTS[key] ?? null);
  }

  /** `{ pay_now_enabled: false, ... }` for the storefront */
  async publicMap(): Promise<Record<string, boolean | string>> {
    const rows = await this.repo.find({ where: { is_public: 1 } });
    const map: Record<string, boolean | string> = {};

    // start from defaults so a missing row still yields a safe value
    for (const [k, v] of Object.entries(SETTING_DEFAULTS)) {
      map[k] = v === '1' ? true : v === '0' ? false : v;
    }
    for (const r of rows) {
      map[r.key_name] = r.value === '1' ? true : r.value === '0' ? false : r.value;
    }
    return map;
  }

  async set(key: string, value: string, adminId?: number): Promise<AppSetting> {
    let row = await this.repo.findOne({ where: { key_name: key } });
    if (!row) {
      row = this.repo.create({ key_name: key, value, is_public: 1 });
    } else {
      row.value = value;
    }
    if (adminId) row.updated_by = adminId;
    return this.repo.save(row);
  }
}
