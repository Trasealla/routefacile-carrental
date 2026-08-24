import { IsDateString, IsOptional, Validate } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { PaginationDto } from "src/dtos/pagination.dto";

export class UserDocumentDto extends PaginationDto {

    @ApiProperty({
        title: 'user email',
        format: 'string',
        required: false,
        default: ''
    })
    @IsOptional()
    user_email: string;
}