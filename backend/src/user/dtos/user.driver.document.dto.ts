import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsString, Validate } from "class-validator";
import { UserDocumentSetTypes } from "src/entities/enums/user.document.set.type";
import { UserDocumentTypes } from "src/entities/enums/user.document.type";
import { UserDriver } from "src/entities/user.driver.entity";
import { User } from "src/entities/user.entity";
import { IsExists } from "src/validators/exists.validator";

export class UserDriverDocumentDto {

    @ApiProperty()
    @IsNotEmpty()
    doc_number: string

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'format must be in the format YYYY-MM-DD' })
    issue_date: string

    @ApiProperty()
    @IsNotEmpty()
    @IsDateString({ strict: true }, { message: 'format must be in the format YYYY-MM-DD' })
    expiry_date: string

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(UserDocumentSetTypes)
    doc_set_type: string

    @ApiProperty()
    @IsNotEmpty()
    @IsEnum(UserDocumentTypes)
    doc_type: string

    @ApiProperty()
    @IsNotEmpty()
    @Validate(IsExists, [User, 'id'])
    user_id: number

    @ApiProperty()
    @IsNotEmpty()
    @Validate(IsExists, [UserDriver, 'id'])
    user_driver_id: number

    front_image: string

    back_image: string
}