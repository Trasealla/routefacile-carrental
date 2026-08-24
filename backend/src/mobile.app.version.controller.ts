import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from './auth/guard/apikey-auth.guard';

@ApiExcludeController()
@UseGuards(ApiKeyAuthGuard)
@Controller('app/version')
export class MobileAppVersionController {

    @Get()
    mobileAppVersion(@Query() query: { platform: string }) {
        const verions = { android: '1.3', ios: '1' }

        if (!['android', 'ios'].includes(query.platform)) {
            return new BadRequestException('platform must be android or ios')
        }

        return {
            platform: query.platform,
            latest_version: verions[query.platform],
            force_update: true,
        }
    }
}
