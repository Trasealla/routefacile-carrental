import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) { }

  async set(key: string, value: any) {
    await this.cacheManager.set(key, value);
  }

  async get(key: string) {
    const value = await this.cacheManager.get(key);

    return value;
  }

  async delete(key: string) {
    await this.cacheManager.del(key);
  }

  async deleteByPrefix(prefix: string) {
    try {
      const client = (this.cacheManager.store as any).getClient();
      const keys: string[] = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(keys);
      }
    } catch (error) {
      // Silently fail if Redis client is unavailable
    }
  }
}
