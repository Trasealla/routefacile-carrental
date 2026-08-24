import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { AdjustService } from './adjust.service';
import { of, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('AdjustService', () => {
    let service: AdjustService;
    let httpService: HttpService;

    const mockHttpService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AdjustService,
                {
                    provide: HttpService,
                    useValue: mockHttpService,
                },
            ],
        }).compile();

        service = module.get<AdjustService>(AdjustService);
        httpService = module.get<HttpService>(HttpService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('trackMonthlyBooking', () => {
        it('should return false when no device ID is provided', async () => {
            const result = await service.trackMonthlyBooking('', 123);
            expect(result).toBe(false);
            expect(mockHttpService.get).not.toHaveBeenCalled();
        });

        it('should return false when device ID is null', async () => {
            const result = await service.trackMonthlyBooking(null as any, 123);
            expect(result).toBe(false);
            expect(mockHttpService.get).not.toHaveBeenCalled();
        });

        it('should successfully track monthly booking event', async () => {
            const mockResponse: AxiosResponse = {
                data: 'OK',
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockHttpService.get.mockReturnValue(of(mockResponse));

            const result = await service.trackMonthlyBooking('test-adid-123', 456, 1500, 'MAD');

            expect(result).toBe(true);
            expect(mockHttpService.get).toHaveBeenCalledTimes(1);
            
            const callUrl = mockHttpService.get.mock.calls[0][0];
            expect(callUrl).toContain('https://s2s.adjust.com/event');
            expect(callUrl).toContain('s2s=1');
            expect(callUrl).toContain('event_token=c9x3b7');
            expect(callUrl).toContain('adid=test-adid-123');
            expect(callUrl).toContain('revenue=1500');
            expect(callUrl).toContain('currency=MAD');
        });

        it('should handle API errors gracefully', async () => {
            mockHttpService.get.mockReturnValue(throwError(() => new Error('Network error')));

            const result = await service.trackMonthlyBooking('test-adid-123', 456);

            expect(result).toBe(false);
        });

        it('should return false for non-200 status codes', async () => {
            const mockResponse: AxiosResponse = {
                data: 'Error',
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config: {} as any,
            };

            mockHttpService.get.mockReturnValue(of(mockResponse));

            const result = await service.trackMonthlyBooking('test-adid-123', 456);

            expect(result).toBe(false);
        });
    });

    describe('trackEvent', () => {
        it('should successfully track a generic event', async () => {
            const mockResponse: AxiosResponse = {
                data: 'OK',
                status: 200,
                statusText: 'OK',
                headers: {},
                config: {} as any,
            };

            mockHttpService.get.mockReturnValue(of(mockResponse));

            const result = await service.trackEvent('test-token', 'test-adid', {
                revenue: 100,
                currency: 'USD',
                callbackParams: { booking_id: '123' },
            });

            expect(result).toBe(true);
            
            const callUrl = mockHttpService.get.mock.calls[0][0];
            expect(callUrl).toContain('event_token=test-token');
            expect(callUrl).toContain('adid=test-adid');
            expect(callUrl).toContain('revenue=100');
            expect(callUrl).toContain('currency=USD');
        });

        it('should return false when no device ID is provided', async () => {
            const result = await service.trackEvent('test-token', '');
            expect(result).toBe(false);
        });
    });
});

