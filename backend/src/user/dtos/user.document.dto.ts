import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, Validate } from "class-validator";
import { UserDocumentTypes } from "src/entities/enums/user.document.type";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";

export class UserDocumentDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(UserDocumentTypes)
    doc_type: string

    @ApiProperty()
    @IsNotEmpty()
    @Validate(IsExists, [User, 'id'])
    user_id: number

    front_image: string

    back_image: string

}