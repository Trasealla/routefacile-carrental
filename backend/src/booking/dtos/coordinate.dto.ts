import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CoordinateDto {
    @ApiProperty({ example: '41.40338' })
    @IsNotEmpty()
    @IsString()
    latitude: string;

    @ApiProperty({ example: '2.17403' })
    @IsNotEmpty()
    @IsString()
    longitude: string;
}