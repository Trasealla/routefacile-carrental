import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';

import { KycSubmission } from 'src/entities/kyc.submission.entity';
import { KycSubmissionAttachment } from 'src/entities/kyc.submission.attachment.entity';
import { SmsResponse } from 'src/entities/sms.response.entity';
import { SmsService } from 'src/mail/sms.service';

import { AdminKycController } from './kyc.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([KycSubmission, KycSubmissionAttachment, SmsResponse]),
        HttpModule,
    ],
    controllers: [AdminKycController],
    providers: [SmsService],
})
export class AdminKycModule {}
