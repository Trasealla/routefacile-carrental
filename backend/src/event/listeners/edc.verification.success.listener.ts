import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EdcVerificationSuccessEvent } from '../events/edc.verification.success.event';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { EdcVerificationService } from 'src/user.form/edc.verification/edc.verification.service';

@Injectable()
export class EdcVerificationSuccessListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(EdcVerificationService) private edcVerificationService: EdcVerificationService
    ) { }

    @OnEvent('edc.verification.success')
    async handleVerificationSuccessEvent(event: EdcVerificationSuccessEvent) {
        // Send confirmation email to the verified member
        const context = {
            full_name: event.full_name,
            student_id: event.student_id,
            promo_code: event.promo_code,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        // Send email to the EDC member with their promo code
        await this.mailService.send(
            event.email,
            "Welcome to Route Facile EDC Exclusive Program",
            'edc_verification_success', // Template name - needs to be created
            context,
            [],
            event.verification_id
        )
    }
}





