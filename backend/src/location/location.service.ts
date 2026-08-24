import { BadRequestException, Injectable } from '@nestjs/common';
import { PickType } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { DropoffTypes } from 'src/entities/enums/dropoff.type';
import { PickupTypes } from 'src/entities/enums/pickup.type';
import { Location } from 'src/entities/location.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class LocationService extends BaseService<Location> {
    constructor(
        @InjectRepository(Location) private locationRepository: Repository<Location>,
    ) {
        super(locationRepository);
    }

    /**
     * Minimum notice a branch needs before a pick-up.
     *
     * A buffer of 0 means the branch takes walk-ups, so there is nothing to
     * enforce and the check is skipped entirely. Without this, a zero buffer
     * still rejected anything earlier than "right now" and told the customer
     * "pickup time must be at least 0 hours from now", which is both an error
     * they cannot act on and a sentence that makes no sense.
     */
    isValidBufferTime(buffer_hours: number, pickup_date: string, pickup_time: string): boolean {
        if (!buffer_hours || buffer_hours <= 0) return true;

        const current_plus_buffer = new Date();
        current_plus_buffer.setHours(current_plus_buffer.getHours() + buffer_hours);
        const pickup_date_time = new Date(`${pickup_date}T${pickup_time}:00`);

        return (pickup_date_time >= current_plus_buffer);
    }

    isValidOpeningHoursRange(selected_date: string, selected_time: string, from_hours: number, to_hours: number, is_closed: number): boolean {

        if (is_closed) {
            return false;
        }
        const selected_date_time = new Date(`${selected_date}T${selected_time}:00`);
        
        const from_date_time = new Date(`${selected_date}T${this.formatHour(from_hours)}:00:00`);

        const to_date_time = new Date(`${selected_date}T${this.formatHour(to_hours)}:00:00`);
        
        return (selected_date_time >= from_date_time && selected_date_time <= to_date_time);
    }

    private formatHour(hour: number): string {
        return hour < 10 ? `0${hour}` : `${hour}`;
    }

    getBaseArray(locations: Location[], location_ids: number[], city_ids: number[]) {

        const result = {};

        locations.forEach(location => {
            const { city_id, id } = location;
            if (city_ids.includes(city_id)) {
                if (!result[city_id]) {
                    result[city_id] = [];
                }

                if (location_ids.includes(id)) {
                    result[city_id].push(id);
                }
            }
        });

        return result;
    }

    async validateLocation(
        pickup_location: Location, 
        dropoff_location: Location, 
        dropoff_type: string, 
        pickup_type: string,
        dropoff_city_id?: number
    ) {
        /**
         * Business Rules:
         * 1. Pickup from PHYSICAL location → dropoff only at PHYSICAL locations (no virtual)
         * 2. Pickup from VIRTUAL location  → dropoff at SAME virtual location OR any PHYSICAL location
         * 3. COLLECTION/DELIVERY dropoff   → restricted if target city has only virtual locations
         *                                    OR if pickup is from a virtual location in a different city
         */

        if (dropoff_type === DropoffTypes.SELF) {
            // Rule 1 & 2: If dropoff location is virtual, only allow if pickup is at the SAME virtual location
            if (dropoff_location && dropoff_location.is_virtual) {
                if (pickup_type === PickupTypes.SELF && pickup_location.id !== dropoff_location.id) {
                    throw new BadRequestException(
                        `Dropoff on this location is not allowed for this pickup location.`
                    );
                }
                if (pickup_type === PickupTypes.DELIVERY) {
                    throw new BadRequestException(
                        `Dropoff is not allowed on this location for delivery pickup type.`
                    );
                }
            }

            // Rule 2: If pickup is virtual, dropoff must be the same virtual location OR a physical location
            if (pickup_type === PickupTypes.SELF && pickup_location && pickup_location.is_virtual) {
                if (dropoff_location && dropoff_location.is_virtual && pickup_location.id !== dropoff_location.id) {
                    throw new BadRequestException(
                        `Dropoff on this virtual location is not allowed. You can only drop off at the same pickup location or any physical location.`
                    );
                }
            }
        }

        if (dropoff_type === DropoffTypes.COLLECTION && dropoff_city_id) {
            // Rule 3a: Block collection dropoff to cities that only have virtual locations
            // unless pickup is from the same city
            const isRestrictedCity = await this.isCityVirtualOnly(dropoff_city_id);
            if (isRestrictedCity) {
                const pickup_city_id = pickup_location?.city_id;
                if (pickup_city_id !== dropoff_city_id) {
                    throw new BadRequestException(
                        `Collection (Meet & Greet) dropoff is not available for this city from your selected pickup location.`
                    );
                }
            }

            // Rule 3b: If pickup is from a virtual location, collection dropoff 
            // is only allowed in the same city as the pickup
            if (pickup_type === PickupTypes.SELF && pickup_location && pickup_location.is_virtual) {
                if (pickup_location.city_id !== dropoff_city_id) {
                    throw new BadRequestException(
                        `Collection (Meet & Greet) dropoff in a different city is not allowed when picking up from this location.`
                    );
                }
            }
        }
    }

    /**
     * Checks if all active locations in an city are virtual (restricted).
     * If an city has only virtual locations, it means we don't have a physical
     * presence there, so collection/meet-and-greet dropoffs should be restricted.
     */
    async isCityVirtualOnly(city_id: number): Promise<boolean> {
        const locations = await this.locationRepository.find({
            where: { city_id, status: 1 },
            select: ['id', 'is_virtual']
        });

        // If no locations exist in this city, treat as restricted
        if (!locations || locations.length === 0) {
            return true;
        }

        // If every location in this city is virtual, it's restricted
        return locations.every(loc => loc.is_virtual);
    }
    
}
