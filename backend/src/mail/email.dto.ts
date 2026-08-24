import { IsString, IsEmail, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({ description: 'Recipient email address' })
  @IsEmail()
  to: string;

  @ApiProperty({ description: 'Email subject' })
  @IsString()
  @Length(1, 100)
  subject: string;

  @ApiProperty({ description: 'Email message' })
  @IsString()
  @Length(1, 500)
  message: string;
}
