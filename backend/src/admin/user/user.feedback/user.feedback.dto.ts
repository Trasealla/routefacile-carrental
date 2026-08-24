import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString, IsNumber, Min, IsEmail, Validate, IsOptional } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { City } from "src/entities/city.entity";
import { UserFeedbackOverallRating } from "src/entities/user.feedback.overall.rating.entity";
import { UserFeedbackRevertReason } from "src/entities/user.feedback.revert.reason.entity";
import { UserFeedbackService } from "src/entities/user.feedback.service.entity";
import { UserFeedbackSource } from "src/entities/user.feedback.source.entity";
import { IsExists } from "src/validators/exists.validator";

export class UserFeedbackDto extends PaginationDto {

    @IsString()
    @IsEmail()
    @ApiProperty()
    @IsOptional()
    email: string

    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @IsOptional()
    @ApiProperty()
    city_id: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackSource, 'id'])
    @ApiProperty()
    user_feedback_source_id: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackService, 'id'])
    @ApiProperty()
    user_feedback_service_id: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackOverallRating, 'id'])
    @ApiProperty()
    overall_rating_id: number

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRevertReason, 'id'])
    @ApiProperty()
    revert_reason_id: number
}
