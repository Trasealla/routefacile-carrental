import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsEnum } from "class-validator";
import { EdcMemberType } from "src/entities/edc.verification.entity";

export class EdcVerificationDto {

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ 
        description: 'EDC Student/Staff ID',
        example: 'EDC12345'
    })
    student_id: string

    @IsNotEmpty()
    @IsString()
    @ApiProperty({ 
        description: 'Full name of the EDC member',
        example: 'John Doe'
    })
    full_name: string

    @IsNotEmpty()
    @IsString()
    @IsEmail()
    @ApiProperty({ 
        description: 'Email address',
        example: 'john.doe@example.com'
    })
    email: string

    @IsOptional()
    @IsString()
    @IsEnum(EdcMemberType)
    @ApiProperty({ 
        description: 'Member type (student, staff, instructor)',
        required: false,
        enum: EdcMemberType,
        default: EdcMemberType.STUDENT
    })
    member_type?: EdcMemberType
}

export class EdcVerificationResponseDto {
    @ApiProperty({ example: 'success' })
    status: string

    @ApiProperty({ example: true })
    verified: boolean

    @ApiProperty({
        example: {
            promo_code: 'EDCVIP2025',
            discount_percentage: 15,
            valid_until: '2025-12-31T23:59:59Z',
            member_type: 'student'
        }
    })
    data?: {
        promo_code: string
        discount_percentage: number
        valid_until: string
        member_type: string
    }

    @ApiProperty({ required: false })
    message?: string
}



