import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, Validate } from "class-validator";
import { NewsletterSubscription } from "src/entities/newsletter.subscription.entity";
import { IsUnique } from "src/validators/unique.validator";

export class NewsletterSubscriptionDto {

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty()
    @Validate(IsUnique, [NewsletterSubscription, 'email'])
    email: string

}
