import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum } from "class-validator";
import { BannerImageTypes } from "src/entities/enums/banner.image.type";

export class BannerDto {
    @ApiProperty({
        description: 'desktop or mobile',
        type: String,
    })
    @IsString()
    @IsNotEmpty()
    @IsEnum(BannerImageTypes)
    type: string
}