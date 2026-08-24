import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AdjustService {
    private readonly logger = new Logger(AdjustService.name);
    
    // Adjust S2S API endpoint
    private readonly ADJUST_S2S_URL = 'https://s2s.adjust.com/event';
    
    // Your Adjust App Token (from Adjust dashboard)
    private readonly APP_TOKEN = process.env.ADJUST_APP_TOKEN || 'aolnzp64pclc';
    
    // Event Tokens
    private readonly MONTHLY_BOOKING_EVENT_TOKEN = process.env.ADJUST_MONTHLY_BOOKING_TOKEN || 'c9x3b7';

    constructor(private readonly httpService: HttpService) {}

    /**
     * Track Monthly Booking event via Adjust S2S API
     * @param adjustDeviceId - The Adjust device ID (adid) from the mobile app
     * @param bookingId - The booking ID for reference
     * @param revenue - Optional revenue amount
     * @param currency - Optional currency (default: MAD)
     */
    async trackMonthlyBooking(
        adjustDeviceId: string,
        bookingId: number,
        revenue?: number,
        currency: string = 'MAD'
    ): Promise<boolean> {
        if (!adjustDeviceId) {
            this.logger.warn(`[Adjust] Cannot track Monthly Booking - No device ID provided for booking ${bookingId}`);
            return false;
        }

        try {
            // Build the S2S URL with parameters
            const params = new URLSearchParams({
                s2s: '1',
                app_token: this.APP_TOKEN,
                event_token: this.MONTHLY_BOOKING_EVENT_TOKEN,
                adid: adjustDeviceId,
            });

            // Add revenue tracking if provided
            if (revenue && revenue > 0) {
                params.append('revenue', revenue.toString());
                params.append('currency', currency);
            }

            // Add custom parameters for tracking
            params.append('callback_params', JSON.stringify({
                booking_id: bookingId.toString(),
                booking_type: 'monthly'
            }));

            const url = `${this.ADJUST_S2S_URL}?${params.toString()}`;

            this.logger.log(`[Adjust] Tracking Monthly Booking event for booking ${bookingId}, device: ${adjustDeviceId}`);

            const response = await firstValueFrom(
                this.httpService.get(url, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'RouteFacile-Backend/1.0'
                    }
                })
            );

            if (response.status === 200) {
                this.logger.log(`[Adjust] Successfully tracked Monthly Booking for booking ${bookingId}`);
                return true;
            } else {
                this.logger.error(`[Adjust] Failed to track event. Status: ${response.status}`);
                return false;
            }
        } catch (error) {
            this.logger.error(`[Adjust] Error tracking Monthly Booking for booking ${bookingId}:`, error.message);
            return false;
        }
    }

    /**
     * Track a generic event via Adjust S2S API
     * @param eventToken - The Adjust event token
     * @param adjustDeviceId - The Adjust device ID (adid)
     * @param params - Additional parameters
     */
    async trackEvent(
        eventToken: string,
        adjustDeviceId: string,
        params?: { revenue?: number; currency?: string; callbackParams?: Record<string, string> }
    ): Promise<boolean> {
        if (!adjustDeviceId) {
            this.logger.warn(`[Adjust] Cannot track event ${eventToken} - No device ID provided`);
            return false;
        }

        try {
            const urlParams = new URLSearchParams({
                s2s: '1',
                app_token: this.APP_TOKEN,
                event_token: eventToken,
                adid: adjustDeviceId,
            });

            if (params?.revenue && params.revenue > 0) {
                urlParams.append('revenue', params.revenue.toString());
                urlParams.append('currency', params.currency || 'MAD');
            }

            if (params?.callbackParams) {
                urlParams.append('callback_params', JSON.stringify(params.callbackParams));
            }

            const url = `${this.ADJUST_S2S_URL}?${urlParams.toString()}`;

            const response = await firstValueFrom(
                this.httpService.get(url, {
                    timeout: 5000,
                    headers: {
                        'User-Agent': 'RouteFacile-Backend/1.0'
                    }
                })
            );

            return response.status === 200;
        } catch (error) {
            this.logger.error(`[Adjust] Error tracking event ${eventToken}:`, error.message);
            return false;
        }
    }
}

