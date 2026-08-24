import { Controller, Get, Inject, UseGuards, Headers } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyAuthGuard } from 'src/auth/guard/apikey-auth.guard';
import { PromoTickerService } from './promo.ticker.service';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('promo-ticker')
@UseGuards(ApiKeyAuthGuard)
@Controller('promo-ticker')
export class PromoTickerPublicController {
    constructor(
        @Inject(PromoTickerService) private promoTickerService: PromoTickerService
    ) { }

    /**
     * Get all active promotional ticker items for the scrolling banner
     * Returns only items that are active and within their valid date range
     */
    @Get()
    async getActivePromoTickers(@Headers('accept-language') lang: string = 'en') {
        const promoTickers = await this.promoTickerService.getActivePromoTickers();

        // Transform response based on language preference
        return promoTickers.map(ticker => {
            const isArabic = lang === 'ae' || lang === 'ar';
            return {
                id: ticker.id,
                text: isArabic ? ticker.text_ar : ticker.text_en,
                description: isArabic ? ticker.description_ar : ticker.description_en,
                link: ticker.link,
                scroll_speed: ticker.scroll_speed
            };
        });
    }

    /**
     * Get all active promotional ticker items with both languages
     */
    @Get('all')
    async getAllActivePromoTickers() {
        const promoTickers = await this.promoTickerService.getActivePromoTickers();

        return promoTickers.map(ticker => 
            this.promoTickerService.removePostfix(ticker)
        );
    }
}







