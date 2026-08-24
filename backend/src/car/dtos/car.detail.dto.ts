import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional } from "class-validator";
import { LangDto } from "src/dtos/lang.dto";

export class CarDetailDto extends LangDto {
    @ApiPropertyOptional({
        description: 'City ID - if provided and car has special_rates_cities configured for this city, returns special_rates_image instead of main image',
        example: 1
    })
    @IsOptional()
    city_id: number;
}