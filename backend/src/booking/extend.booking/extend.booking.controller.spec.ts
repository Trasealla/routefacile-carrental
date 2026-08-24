import { Test, TestingModule } from '@nestjs/testing';
import { ExtendBookingController } from './extend.booking.controller';
import { CarService } from 'src/car/car.service';
import { SurgeService } from '../car.search/surge.service';
import { MiscChargeService } from '../car.search/misc.charge.service';
import { TimeValidationService } from '../services/time.validation.service';
import { LocationService } from 'src/location/location.service';
import { BookingService } from '../services/booking.service';
import { UserService } from 'src/user/user.service';
import { ExtendBookingService } from '../services/extend.booking.service';
import { BookingRepoService } from '../services/booking.repo.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { ExtendActionTypes } from 'src/entities/enums/extend.action.type';
import { SortTypes } from 'src/entities/enums/sort.type';

describe('ExtendBookingController', () => {
  let controller: ExtendBookingController;

  const mockCarService = { clearGroupByQuery: jest.fn() };
  const mockSurgeService = { getOne: jest.fn() };
  const mockMiscChargeService = { getMiscChargesAsObject: jest.fn() };
  const mockTimeValidationService = { validateDropoffTime: jest.fn() };
  const mockLocationService = { getOne: jest.fn() };
  const mockBookingService = {
    getDailyCarRate: jest.fn(),
    getDailyCarExtraRate: jest.fn(),
  };
  const mockUserService = { getOne: jest.fn() };
  const mockExtendBookingService = {
    validateBooking: jest.fn(),
    getDropoffLocationTimeDto: jest.fn(),
    getDtoForRateCalculation: jest.fn(),
    getDropoffDate: jest.fn().mockReturnValue('2026-05-01'),
    extendBooking: jest.fn(),
    getExtensionDetails: jest.fn(),
  };
  const mockBookingRepoService = { getOne: jest.fn() };
  const mockEventEmitter = { emit: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExtendBookingController],
      providers: [
        { provide: CarService, useValue: mockCarService },
        { provide: SurgeService, useValue: mockSurgeService },
        { provide: MiscChargeService, useValue: mockMiscChargeService },
        { provide: TimeValidationService, useValue: mockTimeValidationService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: BookingService, useValue: mockBookingService },
        { provide: UserService, useValue: mockUserService },
        { provide: ExtendBookingService, useValue: mockExtendBookingService },
        { provide: BookingRepoService, useValue: mockBookingRepoService },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    controller = module.get<ExtendBookingController>(ExtendBookingController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('checkEligibility', () => {
    const req = { user: { id: 1 } };

    it('should return eligible:false when booking not found', async () => {
      mockBookingRepoService.getOne.mockResolvedValue(null);

      const result = await controller.checkEligibility('ARC16827', req);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Booking not found');
    });

    it('should return eligible:false when booking has ended', async () => {
      mockBookingRepoService.getOne.mockResolvedValue({
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2020-01-01T10:00:00+04:00'),
        refund_status: RefundStatus.NO,
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
      });

      const result = await controller.checkEligibility('ARC16827', req);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Booking has ended');
    });

    it('should return eligible:false when refund is pending', async () => {
      mockBookingRepoService.getOne.mockResolvedValue({
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2026-12-01T10:00:00+04:00'),
        refund_status: RefundStatus.PENDING,
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
      });

      const result = await controller.checkEligibility('ARC16827', req);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Refund is pending');
    });

    it('should return eligible:false when PAY_NOW and payment pending', async () => {
      mockBookingRepoService.getOne.mockResolvedValue({
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2026-12-01T10:00:00+04:00'),
        refund_status: RefundStatus.NO,
        payment_type: PaymentTypes.PAY_NOW,
        payment_status: 0,
      });

      const result = await controller.checkEligibility('ARC16827', req);
      expect(result.eligible).toBe(false);
      expect(result.reason).toBe('Payment pending for this booking');
    });

    it('should return eligible:true for valid booking', async () => {
      mockBookingRepoService.getOne.mockResolvedValue({
        booking_number: 'ARC16827',
        type: BookingTypes.DAILY,
        payment_type: PaymentTypes.PAY_LATER,
        pickup_date_time: new Date('2026-04-20T08:00:00+04:00'),
        dropoff_date_time: new Date('2026-12-01T10:00:00+04:00'),
        car_id: 10,
        total_amount: 500,
        refund_status: RefundStatus.NO,
        payment_status: 1,
      });

      const result = await controller.checkEligibility('ARC16827', req);
      expect(result.eligible).toBe(true);
      expect(result.booking).toBeDefined();
      expect(result.booking!.booking_number).toBe('ARC16827');
    });
  });

  describe('extend', () => {
    const req = { user: { id: 1 } };
    const ip = '127.0.0.1';

    const parentBooking = {
      id: 1,
      booking_number: 'ARC16827',
      type: BookingTypes.DAILY,
      payment_type: PaymentTypes.PAY_LATER,
      pickup_location_id: 1,
      dropoff_location_id: 2,
      car_extras: [],
    };

    const body = {
      booking_number: 'ARC16827' as any,
      dropoff_date: '2026-06-01',
      dropoff_time: '14:00',
      action_type: ExtendActionTypes.EXTEND,
      booking_source: 'web',
    };

    beforeEach(() => {
      mockExtendBookingService.validateBooking.mockResolvedValue(parentBooking);
      mockExtendBookingService.getDropoffLocationTimeDto.mockReturnValue({});
      mockExtendBookingService.getDtoForRateCalculation.mockReturnValue({});
      mockCarService.clearGroupByQuery.mockResolvedValue(undefined);
      mockUserService.getOne.mockResolvedValue({ id: 1 });
      mockMiscChargeService.getMiscChargesAsObject.mockResolvedValue({ vat: 5 });
      mockLocationService.getOne.mockResolvedValue({ id: 1, city_id: 1 });
      mockSurgeService.getOne.mockResolvedValue(null);
      mockBookingService.getDailyCarRate.mockResolvedValue({});
      mockBookingService.getDailyCarExtraRate.mockResolvedValue({ rate: 0 });
      mockExtendBookingService.extendBooking.mockResolvedValue({ id: 99 });
      mockExtendBookingService.getExtensionDetails.mockResolvedValue({});
    });

    it('should extend booking and emit event for PAY_LATER', async () => {
      const result = await controller.extend(body, req, ip);

      expect(result.status).toBe('success');
      expect(result.booking).toEqual({ id: 99 });
      expect(result.payment_type).toBe(PaymentTypes.PAY_LATER);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'extend.booking',
        expect.anything(),
      );
    });

    it('should not emit event for CHECK action', async () => {
      const checkBody = { ...body, action_type: ExtendActionTypes.CHECK };

      await controller.extend(checkBody, req, ip);

      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should not emit event for PAY_NOW bookings', async () => {
      const payNowParent = { ...parentBooking, payment_type: PaymentTypes.PAY_NOW };
      mockExtendBookingService.validateBooking.mockResolvedValue(payNowParent);

      const result = await controller.extend(body, req, ip);

      expect(result.payment_type).toBe(PaymentTypes.PAY_NOW);
      expect(mockEventEmitter.emit).not.toHaveBeenCalled();
    });

    it('should call validateBooking with correct params', async () => {
      await controller.extend(body, req, ip);

      expect(mockExtendBookingService.validateBooking).toHaveBeenCalledWith(body, 1);
    });

    it('should call timeValidationService', async () => {
      await controller.extend(body, req, ip);

      expect(mockTimeValidationService.validateDropoffTime).toHaveBeenCalled();
    });
  });
});
