import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional, IsNumber, Min } from "class-validator";
import { Type } from "class-transformer";
import { CouponTypes } from "src/entities/enums/coupon.type";



export class DiscountCouponListingDto {

    @ApiProperty({
        minimum: 1,
        title: 'type',
        format: 'int32',
        required: false,
        default: CouponTypes.DAILY
    })
    @IsString()
    @IsOptional()
    @IsEnum(CouponTypes)
    type: string

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page: number

    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @IsOptional()
    page_size: number

}

