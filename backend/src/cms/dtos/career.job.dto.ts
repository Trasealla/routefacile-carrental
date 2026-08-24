import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, Min, Validate } from "class-validator";
import { CareerJob } from "src/entities/career.job.entity";
import { IsExists } from "src/validators/exists.validator";

export class CareerJobDto {

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [CareerJob, 'id'])
    id: number
}