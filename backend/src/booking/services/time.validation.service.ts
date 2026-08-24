import { BadRequestException, Injectable } from "@nestjs/common";
import { CityOpeningHourService } from "src/city/city.opening_hour.service";
import { CityService } from "src/city/city.service";
import { LocationOpeningHourService } from "src/location/location.opening.hour.service";
import { LocationService } from "src/location/location.service";
import { PickupLocationTimeDto } from "../dtos/pickup.location.time.dto"; 
import { PickupTypes } from "src/entities/enums/pickup.type";
import { DropoffLocationTimeDto } from "../dtos/dropoff.location.time.dto"; 
import { DropoffTypes } from "src/entities/enums/dropoff.type";
import { getDaysBetweenDates } from "src/admin/utils/date.util";
import { MINIMUM_BOOKING_DURATION_HOURS } from "src/config/contants";
import { LessThanOrEqual, MoreThanOrEqual } from "typeorm";
import { LocationOpeningHourExceptionService } from "src/location/location.opening.hour.exception.service";

@Injectable()
export class TimeValidationService {

    constructor(
        private readonly locationService: LocationService,
        private readonly locationOpeningHourService: LocationOpeningHourService,
        private readonly locationOpeningHourExceptionService: LocationOpeningHourExceptionService,
        private readonly cityService: CityService,
        private readonly cityOpeningHourService: CityOpeningHourService,
    ) { }

    async validatePickupTime(body: PickupLocationTimeDto) {
        if (body.pickup_type === PickupTypes.SELF) {
            const whereLocation = { id: body.pickup_location_id };
            const location = await this.locationService.getOne(whereLocation);
            if (!location) throw new BadRequestException('Location not found');

            const buffer_hours = location.buffer_hours;
            if (!this.locationService.isValidBufferTime(buffer_hours, body.pickup_date, body.pickup_time)) {
                throw new BadRequestException(`Pickup time must be at least ${buffer_hours} hours from now for this location`);
            }

            const pickup_day = new Date(body.pickup_date).getDay() + 1;

            // check exception hours by date range
            const exception_opening_hour_where = { location_id: location.id, start_date: LessThanOrEqual(body.pickup_date), end_date: MoreThanOrEqual(body.pickup_date) }
            const exception_opening_hours = await this.locationOpeningHourExceptionService.getAll(exception_opening_hour_where);
            let opening_hours_flag = false;
            if (exception_opening_hours.data.length) {
                const daySpecific = exception_opening_hours.data.filter(e => e.day === pickup_day);
                const dayGeneral = exception_opening_hours.data.filter(e => e.day === null);
                const daySpecificShifts = new Set(daySpecific.map(e => e.shift));
                const applicable = [...daySpecific, ...dayGeneral.filter(e => !daySpecificShifts.has(e.shift))];

                for (const opening_hour_obj of applicable) {
                    if (this.locationService.isValidOpeningHoursRange(body.pickup_date, body.pickup_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                        opening_hours_flag = true;
                        break;
                    }
                }
            } else {
                const opening_hours = await this.locationOpeningHourService.getAll({ day: pickup_day, location_id: location.id });
                if (opening_hours.data.length < 1) throw new BadRequestException('Opening hours not found for today for this location');

                for (const opening_hour_obj of opening_hours.data) {
                    if (this.locationService.isValidOpeningHoursRange(body.pickup_date, body.pickup_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                        opening_hours_flag = true;
                        break;
                    }
                }
            }
            
            if (!opening_hours_flag) {
                throw new BadRequestException('Pickup time is outside of opening hours for this location');
            }

        } else { // Delivery
            const whereCity = { id: body.pickup_city_id };
            const city = await this.cityService.getOne(whereCity);
            if (!city) throw new BadRequestException('City not found');

            const buffer_hours = city.buffer_hours;
            if (!this.locationService.isValidBufferTime(buffer_hours, body.pickup_date, body.pickup_time)) {
                throw new BadRequestException(`Pickup time must be at least ${buffer_hours} hours from now for this city`);
            }

            const pickup_day = new Date(body.pickup_date).getDay() + 1; // date start week from monday, but in system week starts from sunday
            const opening_hours = await this.cityOpeningHourService.getAll({ day: pickup_day, city_id: city.id });
            if (opening_hours.data.length < 1) throw new BadRequestException('Opening hours not found for today for this city');
            let opening_hours_flag = false;
            for (const opening_hour_obj of opening_hours.data) {
                if (this.locationService.isValidOpeningHoursRange(body.pickup_date, body.pickup_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                    opening_hours_flag = true;
                    break;
                }
            }
            if (!opening_hours_flag) {
                throw new BadRequestException('Pickup time is outside of opening hours for this city');
            }
        }
    }

    async validateDropoffTime(body: DropoffLocationTimeDto) {
        if (body.dropoff_type === DropoffTypes.SELF) {
            const whereLocation = {
                id: body.dropoff_location_id
            };
            const location = await this.locationService.getOne(whereLocation);
            if (!location) {
                throw new BadRequestException('Location not found');
            }

            const dropoff_day = new Date(body.dropoff_date).getDay() + 1;

            // check exception hours by date range
            const exception_opening_hour_where = { location_id: location.id, start_date: LessThanOrEqual(body.dropoff_date), end_date: MoreThanOrEqual(body.dropoff_date) }
            const exception_opening_hours = await this.locationOpeningHourExceptionService.getAll(exception_opening_hour_where);
            let opening_hours_flag = false;
            if (exception_opening_hours.data.length) {
                const daySpecific = exception_opening_hours.data.filter(e => e.day === dropoff_day);
                const dayGeneral = exception_opening_hours.data.filter(e => e.day === null);
                const daySpecificShifts = new Set(daySpecific.map(e => e.shift));
                const applicable = [...daySpecific, ...dayGeneral.filter(e => !daySpecificShifts.has(e.shift))];

                for (const opening_hour_obj of applicable) {
                    if (this.locationService.isValidOpeningHoursRange(body.dropoff_date, body.dropoff_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                        opening_hours_flag = true;
                        break;
                    }
                }
            } else {
                const opening_hours = await this.locationOpeningHourService.getAll({ day: dropoff_day, 'location_id': location.id });
                if (opening_hours.data.length < 1) {
                    throw new BadRequestException('Opening hours not found for today for this location');
                }

                for (const opening_hour_obj of opening_hours.data) {

                    if (this.locationService.isValidOpeningHoursRange(body.dropoff_date, body.dropoff_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                        opening_hours_flag = true;
                        break;
                    }
                }
            }
            
            if (!opening_hours_flag) {
                throw new BadRequestException('Dropoff time is outside of opening hours for this location');
            }

        } else { // Collection
            const whereCity = {
                id: body.dropoff_city_id
            };
            const city = await this.cityService.getOne(whereCity);
            if (!city) {
                throw new BadRequestException('City not found');
            }

            const dropoff_day = new Date(body.dropoff_date).getDay() + 1;

            const opening_hours = await this.cityOpeningHourService.getAll({ day: dropoff_day, city_id: city.id });
            if (opening_hours.data.length < 1) {
                throw new BadRequestException('Opening hours not found for today for this location');
            }

            let opening_hours_flag = false;
            for (const opening_hour_obj of opening_hours.data) {

                if (this.locationService.isValidOpeningHoursRange(body.dropoff_date, body.dropoff_time, opening_hour_obj.from_hours, opening_hour_obj.to_hours, opening_hour_obj.is_closed)) {
                    opening_hours_flag = true;
                    break;
                }
            }
            if (!opening_hours_flag) {
                throw new BadRequestException('Dropoff time is outside of opening hours for this city');
            }
        }

        const pickup_date_time = new Date(`${body.pickup_date}T${body.pickup_time}:00`);
        const dropoff_date_time = new Date(`${body.dropoff_date}T${body.dropoff_time}:00`);

        if (pickup_date_time > dropoff_date_time) {
            throw new BadRequestException('Pickup time cannot be greater than dropoff time');
        }

        if (((dropoff_date_time.getTime() - pickup_date_time.getTime()) / 3600000) < MINIMUM_BOOKING_DURATION_HOURS) {
            throw new BadRequestException(`Minimum rent hours shoud be ${MINIMUM_BOOKING_DURATION_HOURS}`);
        }
    }

    validateMonthlyDropoffTime(pickup_date: string, pickup_time: string, dropoff_date: string, dropoff_time: string) {

        const booking_days_res = getDaysBetweenDates(pickup_date, pickup_time, dropoff_date, dropoff_time);
        const booking_days = booking_days_res.total_days;

        if (booking_days < 30) {
            throw new BadRequestException('Booking cannot be less than a month ')
        }
        
       // const cal_months = Math.floor(booking_days / 30);
        const pickup_date_obj = new Date(pickup_date);
       // pickup_date.setMonth(pickup_date.getMonth() + cal_months);
        const dropoff_date_obj = new Date(dropoff_date);
        if (dropoff_date_obj < pickup_date_obj) {
            throw new BadRequestException('Dropoff date must be more than a month')
        }
    }

    async validateOneBooking(pickup_date: string, user_id: number) {
        const query = `SELECT 
                            b.id,
                            b.booking_number
                        FROM
                            bookings AS b
                                INNER JOIN
                            (SELECT 
                                booking_number, MAX(id) AS latest_id
                            FROM
                                bookings
                            WHERE
                                (payment_type != 'now'
                                    OR payment_status = 1)
                            GROUP BY booking_number) AS la ON b.id = la.latest_id
                            AND b.user_id = ${user_id}
                            AND b.action != 'cancel'
                            AND b.dropoff_date_time >= NOW()
                            AND '${pickup_date}' between Date(pickup_date_time) and Date(dropoff_date_time)`;
                            
        const inprogress_booking = await this.cityService.executeRawQuery(query);

        if (inprogress_booking.length > 0 && process.env.NODE_ENV == 'production') {
            const blocking_booking = inprogress_booking[0];
            throw new BadRequestException(`Booking already in progress (${blocking_booking.booking_number})`)
        }
    }
}
