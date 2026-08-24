import { Injectable, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from 'src/entities/booking.entity';
import { User } from 'src/entities/user.entity';
import { Car } from 'src/entities/car.entity';
import { Location } from 'src/entities/location.entity';
import { BookingService } from 'src/booking/services/booking.service';
import { CancelBookingService } from 'src/booking/services/cancel.booking.service';
import { XmlService } from './xml.service';
import { OTA_VehResRQ, OTA_VehCancelRQ, OTA_VehModifyRQ } from '../interfaces/ota.interfaces';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { BookingSources } from 'src/entities/enums/booking.source';
import { PickupTypes } from 'src/entities/enums/pickup.type';
import { DropoffTypes } from 'src/entities/enums/dropoff.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TsdReservationService {
  private readonly CURRENCY_CODE = 'MAD';
  private readonly VENDOR_CODE = 'ROUTEFACILE';
  private readonly VENDOR_NAME = 'Route Facile Car Rental';

  constructor(
    @InjectRepository(Booking) private bookingRepository: Repository<Booking>,
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Car) private carRepository: Repository<Car>,
    @InjectRepository(Location) private locationRepository: Repository<Location>,
    @Inject(BookingService) private bookingService: BookingService,
    @Inject(CancelBookingService) private cancelBookingService: CancelBookingService,
    @Inject(XmlService) private xmlService: XmlService,
    private configService: ConfigService
  ) {}

  /**
   * Process Vehicle Reservation Request
   */
  async processReservationRequest(request: OTA_VehResRQ): Promise<string> {
    try {
      const rentalCore = request.VehResRQCore?.VehRentalCore;
      const customer = request.VehResRQCore?.Customer?.Primary;
      const vehPref = request.VehResRQCore?.VehPref;

      if (!rentalCore || !customer) {
        return this.xmlService.buildErrorRS('OTA_VehResRS', [{
          code: '400',
          type: 'Business',
          message: 'Missing required VehRentalCore or Customer data'
        }]);
      }

      // Extract pickup and return details - XML attributes come with @_ prefix
      const pickupDateTime = rentalCore['@_PickUpDateTime'] || rentalCore.PickUpDateTime;
      const returnDateTime = rentalCore['@_ReturnDateTime'] || rentalCore.ReturnDateTime;

      if (!pickupDateTime || !returnDateTime) {
        return this.xmlService.buildErrorRS('OTA_VehResRS', [{
          code: '400',
          type: 'Business',
          message: 'PickUpDateTime and ReturnDateTime are required'
        }]);
      }

      const { date: pickupDate, time: pickupTime } = this.xmlService.extractDateAndTime(pickupDateTime);
      const { date: returnDate, time: returnTime } = this.xmlService.extractDateAndTime(returnDateTime);

      // Get locations - XML attributes come with @_ prefix
      const pickupLocationCode = rentalCore.PickUpLocation?.['@_LocationCode'] || rentalCore.PickUpLocation?.LocationCode;
      const returnLocationCode = rentalCore.ReturnLocation?.['@_LocationCode'] || rentalCore.ReturnLocation?.LocationCode;
      
      const pickupLocation = await this.getLocationByCode(pickupLocationCode);
      const returnLocation = await this.getLocationByCode(returnLocationCode);

      if (!pickupLocation || !returnLocation) {
        return this.xmlService.buildErrorRS('OTA_VehResRS', [{
          code: '400',
          type: 'Business',
          message: 'Invalid pickup or return location code'
        }]);
      }

      // Get car - XML attributes come with @_ prefix
      const carCode = vehPref?.VehMakeModel?.['@_Code'] || vehPref?.VehMakeModel?.Code || vehPref?.['@_Code'] || vehPref?.Code;
      if (!carCode) {
        return this.xmlService.buildErrorRS('OTA_VehResRS', [{
          code: '400',
          type: 'Business',
          message: 'Vehicle code is required'
        }]);
      }

      const car = await this.carRepository.findOne({
        where: { id: parseInt(carCode, 10), status: 1 },
        relations: ['brand', 'category', 'fuel_type', 'transmission', 'group']
      });

      if (!car) {
        return this.xmlService.buildErrorRS('OTA_VehResRS', [{
          code: '404',
          type: 'Business',
          message: 'Vehicle not found or not available'
        }]);
      }

      // Find or create TSD API user for this customer
      const user = await this.findOrCreateTsdUser(customer);

      // Calculate rental days
      const pickupDateTimeObj = new Date(`${pickupDate}T${pickupTime}`);
      const returnDateTimeObj = new Date(`${returnDate}T${returnTime}`);
      const rentalDays = Math.ceil((returnDateTimeObj.getTime() - pickupDateTimeObj.getTime()) / (1000 * 60 * 60 * 24));

      // Prepare booking data
      const bookingData = {
        booking_type: BookingTypes.DAILY,
        booking_source: BookingSources.API,
        car_id: car.id,
        pickup_type: PickupTypes.SELF,
        pickup_date: pickupDate,
        pickup_time: pickupTime,
        pickup_location_id: pickupLocation.id,
        dropoff_type: DropoffTypes.SELF,
        dropoff_date: returnDate,
        dropoff_time: returnTime,
        dropoff_location_id: returnLocation.id,
        payment_type: request.VehResRQInfo?.RentalPaymentPref?.PaymentType === 'PrePay' 
          ? PaymentTypes.PAY_NOW 
          : PaymentTypes.PAY_LATER,
        comments: request.VehResRQInfo?.Comments?.Comment || '',
        booking_days: rentalDays,
        car_extras: this.mapSpecialEquipment(request.VehResRQCore.SpecialEquipPrefs?.SpecialEquipPref || [])
      };

      // Create booking using existing booking service
      // Note: This is a simplified version - integrate with your actual booking flow
      const booking = await this.createTsdBooking(bookingData, user, car, pickupLocation, returnLocation);

      // Build success response
      const response = {
        Success: {},
        VehResRSCore: {
          VehReservation: {
            VehSegmentCore: {
              ConfID: {
                '@_Type': 'Booking',
                '@_ID': booking.booking_number
              },
              Vendor: {
                '@_CompanyShortName': this.VENDOR_NAME,
                '@_Code': this.VENDOR_CODE
              },
              VehRentalCore: {
                '@_PickUpDateTime': rentalCore.PickUpDateTime,
                '@_ReturnDateTime': rentalCore.ReturnDateTime,
                PickUpLocation: {
                  '@_LocationCode': pickupLocation.id.toString(),
                  LocationName: pickupLocation.name_en
                },
                ReturnLocation: {
                  '@_LocationCode': returnLocation.id.toString(),
                  LocationName: returnLocation.name_en
                }
              },
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
                VehMakeModel: {
                  '@_Name': car.name_en,
                  '@_Code': car.id.toString()
                }
              },
              TotalCharge: {
                '@_RateTotalAmount': booking.car_rate_total?.toString() || '0',
                '@_EstimatedTotalAmount': booking.total_amount?.toString() || '0',
                '@_CurrencyCode': this.CURRENCY_CODE
              }
            },
            Customer: {
              Primary: {
                PersonName: {
                  GivenName: customer?.PersonName?.GivenName || 'TSD',
                  Surname: customer?.PersonName?.Surname || 'Customer'
                },
                Telephone: {
                  '@_PhoneNumber': customer?.Telephone?.['@_PhoneNumber'] || customer?.Telephone?.PhoneNumber || ''
                },
                Email: customer?.Email?.EmailAddress || customer?.Email || ''
              }
            }
          }
        }
      };

      return this.xmlService.buildVehResRS({ response });

    } catch (error) {
      return this.xmlService.buildErrorRS('OTA_VehResRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
    }
  }

  /**
   * Process Vehicle Cancel Request
   */
  async processCancelRequest(request: OTA_VehCancelRQ): Promise<string> {
    try {
      const cancelCore = request.VehCancelRQCore;
      const bookingNumber = cancelCore.UniqueID.ID;

      // Find booking
      const booking = await this.bookingRepository.findOne({
        where: { booking_number: bookingNumber }
      });

      if (!booking) {
        return this.xmlService.buildErrorRS('OTA_VehCancelRS', [{
          code: '404',
          type: 'Business',
          message: 'Booking not found'
        }]);
      }

      // Cancel booking
      const cancelReason = request.VehCancelRQInfo?.CancelReason || 'Cancelled via TSD API';
      await this.cancelBookingService.cancelBooking(
        { booking_id: booking.id, cancellation_reason: cancelReason },
        booking
      );

      // Build success response
      const response = {
        Success: {},
        VehCancelRSCore: {
          '@_CancelStatus': 'Cancelled',
          UniqueID: {
            '@_Type': 'Booking',
            '@_ID': bookingNumber
          },
          CancelRules: {
            CancelRule: {
              '@_Amount': booking.cancellation_charges?.toString() || '0',
              '@_CurrencyCode': this.CURRENCY_CODE,
              '@_Description': 'Cancellation charges applied as per policy'
            }
          }
        }
      };

      return this.xmlService.buildVehCancelRS({ response });

    } catch (error) {
      return this.xmlService.buildErrorRS('OTA_VehCancelRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
    }
  }

  /**
   * Process Vehicle Modify Request
   */
  async processModifyRequest(request: OTA_VehModifyRQ): Promise<string> {
    try {
      const modifyCore = request.VehModifyRQCore;
      const bookingNumber = modifyCore.UniqueID.ID;

      // Find booking
      const booking = await this.bookingRepository.findOne({
        where: { booking_number: bookingNumber },
        relations: ['pickup_location', 'dropoff_location', 'car']
      });

      if (!booking) {
        return this.xmlService.buildErrorRS('OTA_VehModifyRS', [{
          code: '404',
          type: 'Business',
          message: 'Booking not found'
        }]);
      }

      // Apply modifications
      if (modifyCore.VehRentalCore) {
        if (modifyCore.VehRentalCore.PickUpDateTime) {
          const { date, time } = this.xmlService.extractDateAndTime(modifyCore.VehRentalCore.PickUpDateTime);
          booking.pickup_date_time = new Date(`${date}T${time}`);
        }
        if (modifyCore.VehRentalCore.ReturnDateTime) {
          const { date, time } = this.xmlService.extractDateAndTime(modifyCore.VehRentalCore.ReturnDateTime);
          booking.dropoff_date_time = new Date(`${date}T${time}`);
        }
        if (modifyCore.VehRentalCore.PickUpLocation) {
          const location = await this.getLocationByCode(modifyCore.VehRentalCore.PickUpLocation.LocationCode);
          if (location) {
            booking.pickup_location_id = location.id;
          }
        }
        if (modifyCore.VehRentalCore.ReturnLocation) {
          const location = await this.getLocationByCode(modifyCore.VehRentalCore.ReturnLocation.LocationCode);
          if (location) {
            booking.dropoff_location_id = location.id;
          }
        }
      }

      if (modifyCore.VehPref?.VehMakeModel?.Code) {
        const car = await this.carRepository.findOne({
          where: { id: parseInt(modifyCore.VehPref.VehMakeModel.Code, 10), status: 1 }
        });
        if (car) {
          booking.car_id = car.id;
        }
      }

      // Save modifications
      await this.bookingRepository.save(booking);

      // Reload with relations
      const updatedBooking = await this.bookingRepository.findOne({
        where: { id: booking.id },
        relations: ['pickup_location', 'dropoff_location', 'car']
      });

      // Build success response
      const response = {
        Success: {},
        VehModifyRSCore: {
          '@_ModifyStatus': 'Modified',
          VehReservation: {
            VehSegmentCore: {
              ConfID: {
                '@_Type': 'Booking',
                '@_ID': updatedBooking.booking_number
              },
              VehRentalCore: {
                '@_PickUpDateTime': this.xmlService.toOTADateTime(updatedBooking.pickup_date_time),
                '@_ReturnDateTime': this.xmlService.toOTADateTime(updatedBooking.dropoff_date_time),
                PickUpLocation: {
                  '@_LocationCode': updatedBooking.pickup_location_id?.toString(),
                  LocationName: updatedBooking.pickup_location?.name_en || ''
                },
                ReturnLocation: {
                  '@_LocationCode': updatedBooking.dropoff_location_id?.toString(),
                  LocationName: updatedBooking.dropoff_location?.name_en || ''
                }
              },
              TotalCharge: {
                '@_RateTotalAmount': updatedBooking.car_rate_total?.toString() || '0',
                '@_EstimatedTotalAmount': updatedBooking.total_amount?.toString() || '0',
                '@_CurrencyCode': this.CURRENCY_CODE
              }
            }
          }
        }
      };

      return this.xmlService.buildVehModifyRS({ response });

    } catch (error) {
      return this.xmlService.buildErrorRS('OTA_VehModifyRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
    }
  }

  /**
   * Get location by code
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
   * Find or create a user for TSD API bookings
   */
  private async findOrCreateTsdUser(customer: any): Promise<User> {
    // Handle both direct properties and @_ prefixed attributes
    const email = customer?.Email?.EmailAddress || customer?.Email?.['#text'] || customer?.Email || 'tsd@routefacilecarrental.com';
    const givenName = customer?.PersonName?.GivenName || 'TSD';
    const surname = customer?.PersonName?.Surname || 'Customer';
    const rawPhone = customer?.Telephone?.['@_PhoneNumber'] || customer?.Telephone?.PhoneNumber || '501234567';
    const phoneNumber = String(rawPhone); // Ensure it's a string
    
    let user = await this.userRepository.findOne({ where: { email } });
    
    if (!user) {
      // Create a placeholder user for TSD API bookings
      const tempPassword = 'TSD_API_USER_' + Date.now();
      user = this.userRepository.create({
        email: email,
        first_name: givenName,
        last_name: surname,
        phone_code: '+971',
        phone_number: phoneNumber.replace(/^\+?971/, ''),
        password: tempPassword,
        password_org: tempPassword, // Required field
        status: 1
      });
      await this.userRepository.save(user);
    }

    return user;
  }

  /**
   * Create a TSD booking
   */
  private async createTsdBooking(
    bookingData: any,
    user: User,
    car: Car,
    pickupLocation: Location,
    returnLocation: Location
  ): Promise<Booking> {
    // Generate booking number
    const bookingNumber = `TSD${Date.now()}`;
    const bookingLogNumber = `TSD-LOG-${Date.now()}`;

    const booking = this.bookingRepository.create({
      booking_number: bookingNumber,
      booking_log_number: bookingLogNumber,
      type: bookingData.booking_type,
      booking_source: bookingData.booking_source,
      user_id: user.id,
      user_first_name: user.first_name,
      user_last_name: user.last_name,
      user_email: user.email,
      user_phone_code: user.phone_code,
      user_phone_number: user.phone_number,
      car_id: car.id,
      group_id: car.group_id,
      pickup_type: bookingData.pickup_type,
      // Parse as Morocco time (UTC+1): the customer picks a local time
      pickup_date_time: new Date(`${bookingData.pickup_date}T${bookingData.pickup_time}:00+01:00`),
      pickup_location_id: pickupLocation.id,
      pickup_city_id: pickupLocation.city_id,
      dropoff_type: bookingData.dropoff_type,
      // Parse as Morocco time (UTC+1): the customer picks a local time
      dropoff_date_time: new Date(`${bookingData.dropoff_date}T${bookingData.dropoff_time}:00+01:00`),
      dropoff_location_id: returnLocation.id,
      dropoff_city_id: returnLocation.city_id,
      booking_days: bookingData.booking_days,
      payment_type: bookingData.payment_type,
      comments: bookingData.comments,
      car_extras: bookingData.car_extras,
      user_ip: '0.0.0.0',
      // Placeholder amounts - should integrate with actual rate calculation
      car_rate_total: 0,
      total_amount: 0,
      vat_percentage: 5
    });

    return await this.bookingRepository.save(booking);
  }

  /**
   * Map OTA special equipment to car extras
   */
  private mapSpecialEquipment(equipmentPrefs: any[]): any[] {
    const equipmentMap: { [key: string]: string } = {
      'CBST': 'child_seat',
      'CBBST': 'baby_seat',
      'CBBS': 'booster_seat',
      'NAV': 'gps',
      'SKI': 'ski_rack',
      'WIFI': 'wifi'
    };

    return equipmentPrefs.map(equip => ({
      type: equipmentMap[equip.EquipType] || equip.EquipType,
      quantity: equip.Quantity || 1
    })).filter(e => e.type);
  }
}

