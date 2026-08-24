import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, IsEnum } from "class-validator";
import { UIVoteChoice } from "src/entities/ui.vote.entity";

export class UIVoteDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Username of the voter' })
    username: string;

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: 'Phone number of the voter' })
    phone_number: string;

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty({ description: 'Email of the voter' })
    email: string;

    @IsNotEmpty()
    @IsEnum(UIVoteChoice)
    @ApiProperty({ 
        description: 'Vote choice: first (existing UI) or second (new UI)',
        enum: UIVoteChoice 
    })
    choice: UIVoteChoice;
}

