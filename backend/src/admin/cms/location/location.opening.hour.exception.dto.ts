import { IsNotEmpty, IsInt, Min, Max, IsDateString, IsOptional } from "class-validator";

export class LocationOpeningHourExceptionDto {

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'start_date must be in the format YYYY-MM-DD' })
    start_date: string;

    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'end_date must be in the format YYYY-MM-DD' })
    end_date: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(7)
    day: number;

    @Min(1)
    @Max(2)
    @IsNotEmpty()
    @IsInt()
    shift: number;

    @Min(0)
    @Max(23)
    @IsNotEmpty()
    @IsInt()
    from_hours: number;

    @Min(0)
    @Max(24)
    @IsNotEmpty()
    @IsInt()
    to_hours: number;

    @Min(0)
    @Max(1)
    @IsNotEmpty()
    @IsInt()
    is_closed: number;

    created_by: number

    updated_by: number
}