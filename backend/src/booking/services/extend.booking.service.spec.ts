import { Test, TestingModule } from '@nestjs/testing';
import { ExtendBookingService } from './extend.booking.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { BookingService } from './booking.service';
import { BookingRepoService } from './booking.repo.service';
import { BadRequestException } from '@nestjs/common';
import { RefundStatus } from 'src/entities/enums/refund.status';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { ExtendActionTypes } from 'src/entities/enums/extend.action.type';
import { BookingActions } from 'src/entities/enums/booking.action';
import { BookingTypes } from 'src/entities/enums/booking.type';

describe('ExtendBookingService', () => {
  let service: ExtendBookingService;
  let bookingRepo: any;
  let bookingService: any;
  let bookingRepoService: any;

  const mockBookingRepo = {
    insert: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    query: jest.fn(),
    manager: { query: jest.fn() },
  };

  const mockBookingService = {
    calculateSubTotal: jest.fn().mockReturnValue(100),
    getDailyCarRate: jest.fn(),
    getDailyCarExtraRate: jest.fn(),
  };

  const mockBookingRepoService = {
    getOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExtendBookingService,
        { provide: getRepositoryToken(Booking), useValue: mockBookingRepo },
        { provide: BookingService, useValue: mockBookingService },
        { provide: BookingRepoService, useValue: mockBookingRepoService },
      ],
    }).compile();

    service = module.get<ExtendBookingService>(ExtendBookingService);
    bookingRepo = mockBookingRepo;
    bookingService = mockBookingService;
    bookingRepoService = mockBookingRepoService;

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateBooking', () => {
    const validBody = {
      booking_number: 'ARC16827' as any,
      dropoff_date: '2026-05-20',
      dropoff_time: '14:00',
      action_type: ExtendActionTypes.EXTEND,
      booking_source: 'web',
    };

    it('should throw BadRequestException when booking is not found', async () => {
      mockBookingRepoService.getOne.mockResolvedValue(null);

      await expect(service.validateBooking(validBody, 1)).rejects.toThrow(
        new BadRequestException('Booking not found.'),
      );
    });

    it('should throw BadRequestException when booking has ended', async () => {
      const pastBooking = {
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2020-01-01T10:00:00+04:00'),
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
        refund_status: RefundStatus.NO,
      };
      mockBookingRepoService.getOne.mockResolvedValue(pastBooking);

      await expect(service.validateBooking(validBody, 1)).rejects.toThrow(
        new BadRequestException('Cannot extend if booking is ended'),
      );
    });

    it('should throw BadRequestException when new dropoff time is before existing', async () => {
      const futureBooking = {
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2026-06-01T10:00:00+04:00'),
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
        refund_status: RefundStatus.NO,
      };
      mockBookingRepoService.getOne.mockResolvedValue(futureBooking);

      const earlyBody = {
        ...validBody,
        dropoff_date: '2026-04-15',
        dropoff_time: '10:00',
      };

      await expect(service.validateBooking(earlyBody, 1)).rejects.toThrow(
        new BadRequestException('New dropoff time cannot be less than the existing one'),
      );
    });

    it('should throw BadRequestException when refund is pending', async () => {
      const bookingWithPendingRefund = {
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2026-06-01T10:00:00+04:00'),
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
        refund_status: RefundStatus.PENDING,
      };
      mockBookingRepoService.getOne.mockResolvedValue(bookingWithPendingRefund);

      const laterBody = {
        ...validBody,
        dropoff_date: '2026-07-01',
        dropoff_time: '14:00',
      };

      await expect(service.validateBooking(laterBody, 1)).rejects.toThrow(
        new BadRequestException('Booking cannnot be edited because refund is pending'),
      );
    });

    it('should return parent booking when all validations pass', async () => {
      const validBooking = {
        booking_number: 'ARC16827',
        dropoff_date_time: new Date('2026-05-01T10:00:00+04:00'),
        payment_type: PaymentTypes.PAY_LATER,
        payment_status: 1,
        refund_status: RefundStatus.NO,
      };
      mockBookingRepoService.getOne.mockResolvedValue(validBooking);

      const result = await service.validateBooking(validBody, 1);
      expect(result).toEqual(validBooking);
    });
  });

  describe('getDropoffLocationTimeDto', () => {
    it('should return correct DTO structure', () => {
      const booking = {
        pickup_date_time: new Date('2026-04-20T08:00:00Z'),
        dropoff_address: '123 Main St',
        dropoff_coordinates: '25.2,55.3',
        dropoff_city_id: 1,
        dropoff_location_id: 5,
        dropoff_type: 'office',
        type: BookingTypes.DAILY,
      } as any;

      const body = {
        dropoff_time: '16:00',
        dropoff_date: '2026-05-01',
      };

      const result = service.getDropoffLocationTimeDto(booking, body);

      expect(result).toEqual(
        expect.objectContaining({
          dropoff_time: '16:00',
          dropoff_date: '2026-05-01',
          dropoff_address: '123 Main St',
          dropoff_coordinates: '25.2,55.3',
          dropoff_city_id: 1,
          dropoff_location_id: 5,
          dropoff_type: 'office',
          booking_type: BookingTypes.DAILY,
        }),
      );
    });
  });

  describe('getDtoForRateCalculation', () => {
    it('should build rate calculation DTO from booking and body', () => {
      const booking = {
        type: BookingTypes.DAILY,
        car_id: 10,
        pickup_type: 'office',
        pickup_date_time: new Date('2026-04-20T08:00:00Z'),
        dropoff_date_time: new Date('2026-04-25T14:00:00Z'),
        pickup_location_id: 1,
        pickup_coordinates: '25.2,55.3',
        pickup_address: 'Pickup',
        pickup_city_id: 1,
        dropoff_type: 'office',
        dropoff_location_id: 2,
        dropoff_city_id: 2,
        dropoff_coordinates: '25.3,55.4',
        dropoff_address: 'Dropoff',
        booking_months: 0,
        extra_kms_per_month: 0,
        payment_type: PaymentTypes.PAY_LATER,
        car_extras: [],
        booking_days: 5,
        inter_cities_charges: 0,
        pickup_parking_charges: 0,
        dropoff_parking_charges: 0,
        delivery_charges: 0,
        collection_charges: 0,
        vmd_charges: 10,
      } as any;

      const body = {
        booking_number: 'ARC16827' as any,
        dropoff_date: '2026-05-01',
        dropoff_time: '16:00',
        action_type: ExtendActionTypes.EXTEND,
        booking_source: 'web',
      };

      const result = service.getDtoForRateCalculation(booking, body);

      expect(result.car_id).toBe(10);
      expect(result.dropoff_date).toBe('2026-05-01');
      expect(result.dropoff_time).toBe('16:00');
      expect(result.action_type).toBe(ExtendActionTypes.EXTEND);
      expect(result.booking_source).toBe('web');
      expect(result.payment_type).toBe(PaymentTypes.PAY_LATER);
    });
  });

  describe('date/time helper methods', () => {
    const booking = {
      pickup_date_time: new Date('2026-04-20T08:30:00Z'),
      dropoff_date_time: new Date('2026-04-25T14:45:00Z'),
    } as any;

    it('getPickupTime should return HH:MM format', () => {
      const result = service.getPickupTime(booking);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('getPickupDate should return YYYY-MM-DD format', () => {
      const result = service.getPickupDate(booking);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('getDropoffTime should return HH:MM format', () => {
      const result = service.getDropoffTime(booking);
      expect(result).toMatch(/^\d{2}:\d{2}$/);
    });

    it('getDropoffDate should return YYYY-MM-DD format', () => {
      const result = service.getDropoffDate(booking);
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('extendBooking', () => {
    const baseBody = {
      booking_number: 'ARC16827' as any,
      dropoff_date: '2026-05-20',
      dropoff_time: '14:00',
      action_type: ExtendActionTypes.EXTEND,
      booking_source: 'web',
    };

    const parentBooking = {
      id: 1,
      booking_number: 'ARC16827',
      booking_source: 'web',
      payment_type: PaymentTypes.PAY_LATER,
      type: BookingTypes.DAILY,
      pickup_type: 'office',
      pickup_date_time: new Date('2026-04-20T08:00:00+04:00'),
      pickup_location_id: 1,
      pickup_city_id: 1,
      pickup_coordinates: '25.2,55.3',
      pickup_address: 'Pickup',
      dropoff_type: 'office',
      dropoff_date_time: new Date('2026-05-01T14:00:00+04:00'),
      dropoff_location_id: 2,
      dropoff_city_id: 2,
      dropoff_coordinates: '25.3,55.4',
      dropoff_address: 'Dropoff',
      car_id: 10,
      booking_days: 11,
      booking_months: 0,
      extra_kms_per_month: 0,
      car_extras: [],
      inter_cities_charges: 0,
      pickup_parking_charges: 0,
      dropoff_parking_charges: 0,
      delivery_charges: 0,
      collection_charges: 0,
      vmd_charges: 10,
      total_amount: 500,
    } as any;

    const queryBookingData = {
      booking_days: 19,
      group_id: 5,
      rate_query: 'SELECT ...',
      car_rate_total: 200,
      pay_now: 180,
      pay_later: 200,
      surge: 10,
      vmd_charges: 10,
      pickup_city_id: 1,
      dropoff_city_id: 2,
    };

    const user = {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
      phone_code: '+971',
      phone_number: '501234567',
      country_id: 1,
    } as any;

    const carExtras = { car_extras_list: [] as any, rate: 0, extra_rate_query: '' };
    const miscCharges = { vat: 5, pay_now: 10 };

    it('should insert booking and return result when action_type is EXTEND', async () => {
      mockBookingRepo.insert.mockResolvedValue({
        identifiers: [{ id: 99 }],
      });

      const result = await service.extendBooking(
        baseBody,
        parentBooking,
        queryBookingData,
        null as any,
        miscCharges,
        user,
        carExtras,
        '127.0.0.1',
      );

      expect(mockBookingRepo.insert).toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          id: 99,
          booking_number: 'ARC16827',
        }),
      );
    });

    it('should return check details when action_type is CHECK', async () => {
      const checkBody = { ...baseBody, action_type: ExtendActionTypes.CHECK };

      const result = await service.extendBooking(
        checkBody,
        parentBooking,
        queryBookingData,
        null as any,
        miscCharges,
        user,
        carExtras,
        '127.0.0.1',
      );

      expect(mockBookingRepo.insert).not.toHaveBeenCalled();
      expect(result).toEqual(
        expect.objectContaining({
          booking_number: 'ARC16827',
          details: expect.objectContaining({
            extended_days: 19,
            car_rate: 200,
          }),
        }),
      );
    });

    it('should set action to EXTEND on the booking entity', async () => {
      mockBookingRepo.insert.mockResolvedValue({
        identifiers: [{ id: 100 }],
      });

      await service.extendBooking(
        baseBody,
        parentBooking,
        queryBookingData,
        null as any,
        miscCharges,
        user,
        carExtras,
        '127.0.0.1',
      );

      const insertedBooking = mockBookingRepo.insert.mock.calls[0][0];
      expect(insertedBooking.action).toBe(BookingActions.EXTEND);
      expect(insertedBooking.parent_id).toBe(1);
      expect(insertedBooking.booking_number).toBe('ARC16827');
    });

    it('should throw BadRequestException on failed insert', async () => {
      mockBookingRepo.insert.mockResolvedValue({
        identifiers: [{ id: undefined }],
      });

      await expect(
        service.extendBooking(
          baseBody,
          parentBooking,
          queryBookingData,
          null as any,
          miscCharges,
          user,
          carExtras,
          '127.0.0.1',
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
