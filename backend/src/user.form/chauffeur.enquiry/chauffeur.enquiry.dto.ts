import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsEnum, IsNumber, Min, IsEmail, Validate, IsOptional, IsDateString, IsObject, IsNotEmptyObject, Max, ValidateNested, IsInt, ArrayNotEmpty, ArrayMaxSize, IsArray, ValidateIf, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from "class-validator";
import * as dayjs from 'dayjs';

@ValidatorConstraint({ name: 'IsAtLeast12HoursAhead', async: false })
class IsAtLeast12HoursAheadConstraint implements ValidatorConstraintInterface {
    validate(value: string, args: ValidationArguments) {
        if (!value) return false;
        const pickupTime = dayjs(value);
        const now = dayjs();
        return pickupTime.isValid() && pickupTime.isAfter(now.add(12, 'hour'));
    }

    defaultMessage(args: ValidationArguments) {
        return `Pickup time must be at least 12 hours ahead of current time`;
    }
}

class ChildSeat {
    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(3)
    infant: number;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(3)
    toddler: number;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    @Max(3)
    booster: number;
}

export class ChauffeurEnquiryDto {

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    name: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone_code: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    phone_number: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string

    @IsString()
    @IsOptional()
    @ApiProperty()
    car: string

    @IsString()
    @IsOptional()
    @ApiProperty()
    details: string

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    service_type: string

    @ApiProperty({ example: 'YYYY-MM-DD HH:mm' })
    @IsDateString({ strict: true }, { message: 'pickup date must be in the format YYYY-MM-DD HH:mm' })
    @IsNotEmpty()
    @Validate(IsAtLeast12HoursAheadConstraint)
    pickup_date_time: string;

    @ApiProperty({ example: 'Address required for pickup' })
    @IsNotEmpty()
    @IsString()
    pickup_address: string;

    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    pickup_coordinates: string[];

    @ApiProperty({ example: 'YYYY-MM-DD HH:mm' })
    @ValidateIf(o => ['Return Transfer', 'Events', 'City Tour', 'Chauffer Service (Half Day i.e., 5 Hours)', 'Chauffer Service (Full Day i.e., 10 Hours)'].includes(o.service_type))
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'dropoff date must be in the format YYYY-MM-DD HH:mm' })
    dropoff_date_time: string;

    @ApiProperty({ example: 'Address required for dropoff' })
    @IsNotEmpty()
    @IsString()
    dropoff_address: string;

    @ArrayNotEmpty()
    @ArrayMaxSize(2)
    @IsArray()
    @IsNotEmpty()
    dropoff_coordinates: string[];

    @ApiProperty()
    @Min(1)
    @Max(12)
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    passengers: number

    @ApiProperty()
    @Min(0)
    @Max(12)
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    luggage_bags: number

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => ChildSeat)
    child_seats: ChildSeat
}



