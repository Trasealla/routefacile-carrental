import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Location } from 'src/entities/location.entity';
import { LocationOpeningHour } from 'src/entities/location.opening.hour.entity';
import { XmlService } from './xml.service';
import { OTA_VehLocSearchRQ, VehicleLocation } from '../interfaces/ota.interfaces';

@Injectable()
export class TsdLocationService {
  private readonly COUNTRY_CODE = 'AE';

  constructor(
    @InjectRepository(Location) private locationRepository: Repository<Location>,
    @InjectRepository(LocationOpeningHour) private openingHourRepository: Repository<LocationOpeningHour>,
    @Inject(XmlService) private xmlService: XmlService
  ) {}

  /**
   * Process Vehicle Location Search Request
   */
  async processLocationSearchRequest(request: OTA_VehLocSearchRQ): Promise<string> {
    try {
      const searchCriterion = request?.VehLocSearchCriterion;
      
      // Build query based on search criteria
      let locations: Location[];

      if (!searchCriterion) {
        // No criteria - return all active locations
        locations = await this.getAllActiveLocations();
      } else if (searchCriterion.Address?.CityName) {
        // Search by city name (city)
        locations = await this.searchByCityName(searchCriterion.Address.CityName);
      } else if (searchCriterion.RefPoint?.Name || searchCriterion.RefPoint?.['@_Name']) {
        // Search by reference point (location name) - handle @_ prefix
        const refPointName = searchCriterion.RefPoint?.Name || searchCriterion.RefPoint?.['@_Name'];
        locations = await this.searchByRefPoint(refPointName);
      } else if (searchCriterion.Position) {
        // Search by coordinates with radius - handle @_ prefix for attributes
        const lat = searchCriterion.Position?.['@_Latitude'] || searchCriterion.Position?.Latitude;
        const lng = searchCriterion.Position?.['@_Longitude'] || searchCriterion.Position?.Longitude;
        const radius = searchCriterion.Radius?.['@_Distance'] || searchCriterion.Radius?.Distance || 50;
        locations = await this.searchByPosition(
          parseFloat(lat),
          parseFloat(lng),
          radius
        );
      } else {
        // Return all active locations
        locations = await this.getAllActiveLocations();
      }

      // Transform locations to OTA format
      const vehicleLocations = await Promise.all(
        locations.map(loc => this.transformLocationToOTA(loc))
      );

      // Build response
      const response = {
        Success: {},
        VehMatchedLocs: {
          VehMatchedLoc: vehicleLocations
        }
      };

      return this.xmlService.buildVehLocSearchRS({ response });

    } catch (error) {
      return this.xmlService.buildErrorRS('OTA_VehLocSearchRS', [{
        code: '500',
        type: 'System',
        message: error.message || 'Internal server error'
      }]);
    }
  }

  /**
   * Get all locations in OTA XML format
   */
  async getAllLocationsXml(): Promise<string> {
    const locations = await this.getAllActiveLocations();
    const vehicleLocations = await Promise.all(
      locations.map(loc => this.transformLocationToOTA(loc))
    );

    const response = {
      Success: {},
      VehMatchedLocs: {
        VehMatchedLoc: vehicleLocations
      }
    };

    return this.xmlService.buildVehLocSearchRS({ response });
  }

  /**
   * Get all active locations
   */
  private async getAllActiveLocations(): Promise<Location[]> {
    return await this.locationRepository.find({
      where: { status: 1 },
      relations: ['city', 'location_opening_hours'],
      order: { order: 'ASC' }
    });
  }

  /**
   * Search locations by city/city name
   */
  private async searchByCityName(cityName: string): Promise<Location[]> {
    return await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.city', 'city')
      .leftJoinAndSelect('location.location_opening_hours', 'hours')
      .where('location.status = :status', { status: 1 })
      .andWhere('(city.name_en LIKE :city OR city.name_ar LIKE :city)', { city: `%${cityName}%` })
      .orderBy('location.order', 'ASC')
      .getMany();
  }

  /**
   * Search locations by reference point (location name)
   */
  private async searchByRefPoint(refPoint: string): Promise<Location[]> {
    return await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.city', 'city')
      .leftJoinAndSelect('location.location_opening_hours', 'hours')
      .where('location.status = :status', { status: 1 })
      .andWhere('(location.name_en LIKE :name OR location.name_ar LIKE :name OR location.address_en LIKE :name)', 
        { name: `%${refPoint}%` })
      .orderBy('location.order', 'ASC')
      .getMany();
  }

  /**
   * Search locations by position (coordinates) with radius
   * Uses Haversine formula approximation for distance calculation
   */
  private async searchByPosition(lat: number, lng: number, radiusKm: number): Promise<Location[]> {
    // Approximate degree to km conversion for UAE region
    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos(lat * Math.PI / 180));

    return await this.locationRepository
      .createQueryBuilder('location')
      .leftJoinAndSelect('location.city', 'city')
      .leftJoinAndSelect('location.location_opening_hours', 'hours')
      .where('location.status = :status', { status: 1 })
      .andWhere('CAST(location.lat AS DECIMAL(10,6)) BETWEEN :minLat AND :maxLat', {
        minLat: lat - latDelta,
        maxLat: lat + latDelta
      })
      .andWhere('CAST(location.long AS DECIMAL(10,6)) BETWEEN :minLng AND :maxLng', {
        minLng: lng - lngDelta,
        maxLng: lng + lngDelta
      })
      .orderBy('location.order', 'ASC')
      .getMany();
  }

  /**
   * Transform Location entity to OTA VehicleLocation format
   */
  private async transformLocationToOTA(location: Location): Promise<any> {
    // Get opening hours
    const operationTimes = (location.location_opening_hours || []).map(hour => ({
      '@_Day': this.getDayName(hour.day),
      '@_Start': hour.from_hours,
      '@_End': hour.to_hours
    }));

    return {
      '@_LocationCode': location.id.toString(),
      LocationName: location.name_en,
      Address: {
        AddressLine: location.address_en,
        CityName: location.city?.name_en || '',
        CountryName: {
          '@_Code': this.COUNTRY_CODE
        },
        Position: location.lat && location.long ? {
          '@_Latitude': location.lat,
          '@_Longitude': location.long
        } : undefined
      },
      Telephone: {
        '@_PhoneNumber': location.contact_number || ''
      },
      AdditionalInfo: {
        OperationSchedule: operationTimes.length > 0 ? {
          OperationTime: operationTimes
        } : undefined,
        '@_PickupInd': location.pickup ? 'true' : 'false',
        '@_DropoffInd': location.dropoff ? 'true' : 'false'
      }
    };
  }

  /**
   * Get day name from day number (1-7, where 1 is Monday)
   */
  private getDayName(day: number): string {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[day - 1] || 'Unknown';
  }
}

