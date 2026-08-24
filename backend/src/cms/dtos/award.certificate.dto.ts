
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEnum, IsOptional } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";

import { AwardCertificateTypes } from "src/entities/enums/award.certificate.type";

export class AwardCertificateDto extends PaginationDto{

    @ApiProperty({
        description: 'award or certificate',
        type: String,
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @IsEnum(AwardCertificateTypes)
    type: string
}