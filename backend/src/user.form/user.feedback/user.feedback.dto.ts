import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsString, IsNumber, Min, IsEmail, Validate } from "class-validator";
import { City } from "src/entities/city.entity";
import { UserFeedbackOverallRating } from "src/entities/user.feedback.overall.rating.entity";
import { UserFeedbackRating } from "src/entities/user.feedback.rating.entity";
import { UserFeedbackRevertReason } from "src/entities/user.feedback.revert.reason.entity";
import { UserFeedbackServiceCategory } from "src/entities/user.feedback.service.category.entity";
import { UserFeedbackService } from "src/entities/user.feedback.service.entity";
import { UserFeedbackSource } from "src/entities/user.feedback.source.entity";
import { IsExists } from "src/validators/exists.validator";


export class UserFeedbackDto {

    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    first_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    last_name: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    phone_code: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty()
    phone_number: string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    @ApiProperty()
    email: string

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [City, 'id'])
    @ApiProperty()
    city_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackSource, 'id'])
    @ApiProperty()
    user_feedback_source_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackService, 'id'])
    @ApiProperty()
    user_feedback_service_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackServiceCategory, 'id'])
    @ApiProperty()
    user_feedback_service_category_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    product_knowledge_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    professionalism_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    friendliness_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    timely_response_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    reliability_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRating, 'id'])
    @ApiProperty()
    cleanliness_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackOverallRating, 'id'])
    @ApiProperty()
    overall_rating_id: number

    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Validate(IsExists, [UserFeedbackRevertReason, 'id'])
    @ApiProperty()
    revert_reason_id: number

    @IsString()
    @IsNotEmpty()
    @ApiProperty()
    detail: string
}
