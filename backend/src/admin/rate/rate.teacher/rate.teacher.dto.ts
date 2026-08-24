import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Validate,
} from 'class-validator';
import { Car } from 'src/entities/car.entity';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';
import { IsExists } from 'src/validators/exists.validator';

/**
 * Body for PUT /admin/rate/teacher/:id — admin edits the per-car rate row
 * with the extended Teachers Rental fleet fields.
 */
export class RateTeacherUpdateDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Validate(IsExists, [Car, 'id'])
  car_id: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  rate: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  display_order: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @IsEnum(BasicStatusTypes)
  is_featured: number;

  @IsOptional()
  @IsString()
  currency: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  original_rate: number;

  @IsOptional()
  @IsString()
  discount_badge: string;

  /** { "1": 1800, "3": 1600, ... } */
  @IsOptional()
  @IsObject()
  rate_by_duration: Record<string, number>;

  /** [1, 3, 6, 9] */
  @IsOptional()
  @IsArray()
  available_durations: number[];

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  mileage_per_month: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deposit_amount: number;

  @IsOptional() @IsString() cta_label_en: string;
  @IsOptional() @IsString() cta_label_ar: string;
  @IsOptional() @IsString() tagline_en: string;
  @IsOptional() @IsString() tagline_ar: string;

  /** [{ icon: "fa-users", label: "5 Seats" }, ...] */
  @IsOptional() @IsArray() features_en: any[];
  @IsOptional() @IsArray() features_ar: any[];

  updated_by: number;
}
