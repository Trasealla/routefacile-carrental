import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GRecaptchResponseDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNotEmpty()
    g_recaptcha_response: string
}
