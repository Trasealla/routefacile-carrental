import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';

export class CareerJobStatusDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    @IsEnum(BasicStatusTypes)
    status: number;

    updated_by: number;
}
