import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class BrokerCancelBookingDto {
    @IsString() @IsNotEmpty() username: string;
    @IsString() @IsNotEmpty() password: string;

    @IsInt() @Type(() => Number) @IsNotEmpty() booking_id: number;

    @IsOptional() @IsString() reason?: string;
}
