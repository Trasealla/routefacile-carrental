import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan, MoreThanOrEqual } from 'typeorm';
import { Car } from 'src/entities/car.entity';
import { Location } from 'src/entities/location.entity';
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { SurgeService } from 'src/booking/car.search/surge.service';
import { MiscChargeService } from 'src/booking/car.search/misc.charge.service';
import { LocationService } from 'src/location/location.service';
import { XmlService } from './xml.service';
import { OTA_VehAvailRateRQ, VehicleAvailability, VehicleCharge } from '../interfaces/ota.interfaces';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { CouponTypes } from 'src/entities/enums/coupon.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TsdAvailabilityService {
  private readonly CURRENCY_CODE = 'MAD';
  private readonly VENDOR_CODE = 'ROUTEFACILE';
  private readonly VENDOR_NAME = 'Route Facile Car Rental';

  constructor(
    @InjectRepository(Car) private carRepository: Repository<Car>,
    @InjectRepository(Location) private locationRepository: Repository<Location>,
    @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService,
    @Inject(SurgeService) private surgeService: SurgeService,
    @Inject(MiscChargeService) private miscChargeService: MiscChargeService,
    @Inject(LocationService) private locationService: LocationService,
    @Inject(XmlService) private xmlService: XmlService,
    private configService: ConfigService
  ) {}

  /**
   * Process Vehicle Availability Request and return available vehicles
   */
  async processAvailabilityRequest(request: OTA_VehAvailRateRQ): Promise<string> {
    try {
      const rentalCore = request.VehAvailRQCore?.VehRentalCore;
      
      if (!rentalCore) {
        return this.xmlService.buildErrorRS('OTA_VehAvailRateRS', [{
          code: '400',
          type: 'Business',
          message: 'Missing required VehRentalCore data'
        }]);
      }

      // Extract pickup and return details - XML attributes come with @_ prefix
      const pickupDateTimeStr = rentalCore['@_PickUpDateTime'] || rentalCore.PickUpDateTime;
      const returnDateTimeStr = rentalCore['@_ReturnDateTime'] || rentalCore.ReturnDateTime;

      if (!pickupDateTimeStr || !returnDateTimeStr) {
        return this.xmlService.buildErrorRS('OTA_VehAvailRateRS', [{
          code: '400',
          type: 'Business',
          message: 'PickUpDateTime and ReturnDateTime are required'
        }]);
      }

      const { date: pickupDate, time: pickupTime } = this.xmlService.extractDateAndTime(pickupDateTimeStr);
      const { date: returnDate, time: returnTime } = this.xmlService.extractDateAndTime(returnDateTimeStr);
      
      // Get locations - XML attributes come with @_ prefix
      const pickupLocationCode = rentalCore.PickUpLocation?.['@_LocationCode'] || rentalCore.PickUpLocation?.LocationCode;
      const returnLocationCode = rentalCore.ReturnLocation?.['@_LocationCode'] || rentalCore.ReturnLocation?.LocationCode;
      
      const pickupLocation = await this.getLocationByCode(pickupLocationCode);
      const returnLocation = await this.getLocationByCode(returnLocationCode);

      if (!pickupLocation || !returnLocation) {
        return this.xmlService.buildErrorRS('OTA_VehAvailRateRS', [{
          code: '400',
          type: 'Business',
          message: 'Invalid pickup or return location code'
        }]);
      }

      // Calculate rental days
      const pickupDateTime = new Date(`${pickupDate}T${pickupTime}`);
      const returnDateTime = new Date(`${returnDate}T${returnTime}`);
      const rentalDays = Math.ceil((returnDateTime.getTime() - pickupDateTime.getTime()) / (1000 * 60 * 60 * 24));

      // Get available cars
      const cars = await this.getAvailableCars();

      // Get misc charges
      const miscCharges = await this.miscChargeService.getMiscChargesAsObject();

      // Get discount coupon if applicable
      const promotionCode = request.VehAvailRQCore?.VehPrefs?.VehPref?.VehClass?.Size;
      const discountCoupon = promotionCode ? await this.discountCouponService.getOne({
        code: promotionCode,
        type: CouponTypes.DAILY,
        end_date: MoreThan(pickupDate),
        status: DiscountCouponService.ACTIVE
      }) : null;

      // Get surge pricing
      const surge = await this.surgeService.getOne({
        end_date: MoreThanOrEqual(pickupDate),
        status: SurgeService.ACTIVE
      }, [], {}, null, { column: 'created_at', order: 'DESC' });

      // Transform cars to OTA vehicle availability format
      const vehicleAvailabilities = await Promise.all(
        cars.map(car => this.transformCarToVehAvail(car, rentalDays, miscCharges, pickupLocation, returnLocation, discountCoupon, surge))
      );

      // Build response
      const response = {
        Success: {},
        VehAvailRSCore: {
          VehRentalCore: {
            '@_PickUpDateTime': pickupDateTimeStr,
            '@_ReturnDateTime': returnDateTimeStr,
            PickUpLocation: {
              '@_LocationCode': pickupLocation.id.toString(),
              '@_CodeContext': 'ROUTEFACILE',
              LocationName: pickupLocation.name_en
            },
            ReturnLocation: {
              '@_LocationCode': returnLocation.id.toString(),
              '@_CodeContext': 'ROUTEFACILE',
              LocationName: returnLocation.name_en
            }
          },
          VehVendorAvails: {
            VehVendorAvail: {
              Vendor: {
                '@_CompanyShortName': this.VENDOR_NAME,
                '@_TravelSector': '2',
                '@_Code': this.VENDOR_CODE
              },
              VehAvails: {
                VehAvail: vehicleAvailabilities
              }
            }
          }
        }
      };

      return this.xmlService.buildVehAvailRateRS({ response });

    } catch (error) {
      return this.xmlService.buildErrorRS('OTA_VehAvailRateRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
    }
  }

  /**
   * Get location by code (location ID)
   */
  private async getLocationByCode(locationCode: string): Promise<Location | null> {
    try {
      const id = parseInt(locationCode, 10);
      if (isNaN(id)) return null;
      return await this.locationRepository.findOne({ where: { id, status: 1 } });
    } catch {
      return null;
    }
  }

  /**
   * Get available cars with their rates
   */
  private async getAvailableCars(): Promise<Car[]> {
    return await this.carRepository.find({
      where: { status: 1 },
      relations: ['brand', 'category', 'fuel_type', 'transmission', 'group']
    });
  }

  /**
   * Transform Car entity to OTA VehAvail format
   */
  private async transformCarToVehAvail(
    car: Car,
    rentalDays: number,
    miscCharges: any,
    pickupLocation: Location,
    returnLocation: Location,
    discountCoupon: any,
    surge: any
  ): Promise<any> {
    const fileServer = this.configService.get<string>('FILE_SERVER') || '';
    const carsPath = '/uploads/cars/';

    // Calculate rates (simplified - you may need to integrate with actual rate calculation)
    const dailyRate = 150; // This should come from your rate tables
    const baseRate = dailyRate * rentalDays;
    
    // Apply surge if applicable
    let surgeAmount = 0;
    if (surge) {
      surgeAmount = (baseRate * (surge.percentage || 0)) / 100;
    }

    // Apply discount if applicable
    let discountAmount = 0;
    if (discountCoupon) {
      discountAmount = (baseRate * (discountCoupon.percentage || 0)) / 100;
    }

    // Calculate inter-city charges
    let interCityCharges = 0;
    if (pickupLocation.city_id !== returnLocation.city_id) {
      interCityCharges = miscCharges?.inter_city || 0;
    }

    // VAT calculation
    const vatPercentage = miscCharges?.vat_percentage || 5;
    const subtotal = baseRate + surgeAmount - discountAmount + interCityCharges;
    const vatAmount = (subtotal * vatPercentage) / 100;
    const totalAmount = subtotal + vatAmount;

    // Build vehicle charges array
    const vehicleCharges: any[] = [
      {
        '@_Amount': dailyRate.toFixed(2),
        '@_CurrencyCode': this.CURRENCY_CODE,
        '@_Description': 'Daily Rate',
        '@_IncludedInRate': true,
        '@_Purpose': 'Daily',
        '@_TaxInclusive': false
      }
    ];

    if (surgeAmount > 0) {
      vehicleCharges.push({
        '@_Amount': surgeAmount.toFixed(2),
        '@_CurrencyCode': this.CURRENCY_CODE,
        '@_Description': 'Peak Season Surcharge',
        '@_IncludedInRate': true,
        '@_Purpose': 'Surcharge'
      });
    }

    if (discountAmount > 0) {
      vehicleCharges.push({
        '@_Amount': (-discountAmount).toFixed(2),
        '@_CurrencyCode': this.CURRENCY_CODE,
        '@_Description': 'Promotional Discount',
        '@_IncludedInRate': true,
        '@_Purpose': 'Discount'
      });
    }

    if (interCityCharges > 0) {
      vehicleCharges.push({
        '@_Amount': interCityCharges.toFixed(2),
        '@_CurrencyCode': this.CURRENCY_CODE,
        '@_Description': 'Inter-City Charges',
        '@_IncludedInRate': true,
        '@_Purpose': 'Fee'
      });
    }

    vehicleCharges.push({
      '@_Amount': vatAmount.toFixed(2),
      '@_CurrencyCode': this.CURRENCY_CODE,
      '@_Description': `VAT (${vatPercentage}%)`,
      '@_IncludedInRate': true,
      '@_Purpose': 'Tax'
    });

    return {
      VehAvailCore: {
        '@_Status': 'Available',
        Vehicle: {
          '@_AirConditionInd': car.ac ? 'true' : 'false',
          '@_TransmissionType': car.transmission?.name_en || 'Automatic',
          '@_FuelType': car.fuel_type?.name_en || 'Petrol',
          '@_PassengerQuantity': car.passengers_en || '5',
          '@_BaggageQuantity': car.suit_cases_en || '2',
          VehType: {
            '@_VehicleCategory': car.category?.name_en || 'Sedan',
            '@_DoorCount': car.doors_en || '4'
          },
          VehClass: {
            '@_Size': car.group?.name_en || 'Compact'
          },
          VehMakeModel: {
            '@_Name': car.name_en,
            '@_Code': car.id.toString()
          },
          PictureURL: car.image ? `${fileServer}${carsPath}${car.image}` : ''
        },
        RentalRate: {
          RateDistance: {
            '@_Unlimited': 'true',
            '@_DistUnitName': 'Km'
          },
          VehicleCharges: {
            VehicleCharge: vehicleCharges
          },
          RateQualifier: {
            '@_RateCategory': 'Leisure',
            '@_RatePeriod': 'Daily'
          }
        },
        TotalCharge: {
          '@_RateTotalAmount': baseRate.toFixed(2),
          '@_EstimatedTotalAmount': totalAmount.toFixed(2),
          '@_CurrencyCode': this.CURRENCY_CODE
        },
        Reference: {
          '@_Type': 'CarID',
          '@_ID': car.id.toString()
        }
      }
    };
  }
}

