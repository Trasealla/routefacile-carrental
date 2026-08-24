import { Body, Controller, Delete, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';

export class CacheDto {
  key: string;
  value: string;
}
@ApiExcludeController()
@UseGuards(ApiKeyAuthGuard)
@Controller('cache')
export class CacheController {

  constructor(
    @Inject(CacheService) private cacheService: CacheService
  ) { }

  @Post('set')
  set(@Body() body: CacheDto) {
    const { key, value } = body;

    try {
      this.cacheService.set(key, value);
      return { success: true };
    } catch (error) {
      return { success: false, message: `Error setting cache for key: ${key}`, error };
    }
  }

  @Get('get/:key')
  async get(@Param('key') key: string) {
    try {
      const value = await this.cacheService.get(key);

      if (value) {
        return { key, value };
      } else {
        return { key, value: null, message: 'Key not found' };
      }
    } catch (error) {
      return { key, value: null, message: error };
    }
  }

  @Delete('delete/:key')
  async delete(@Param('key') key: string) {
    try {
      await this.cacheService.delete(key);
    } catch (error) {
      return { key, value: null, message: error };
    }
  }
}