import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, Validate } from "class-validator";
import { PaginationDto } from "src/dtos/pagination.dto";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";

export class LoginUserDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    @Validate(IsExists, [User, 'email'])
    email: string
    
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    password?: string
}