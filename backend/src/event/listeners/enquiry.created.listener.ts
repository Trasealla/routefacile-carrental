import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EnquiryCreatedEvent } from '../events/enquiry.created.event';
import { EnquiryService } from 'src/user.form/enquiry/enquiry.service';
import { ENQUIRY_MAIN_RECEPIENT, MARKETING_RECEPIENT } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class EnquiryCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(EnquiryService) private enquiryService: EnquiryService
    ) { }

    @OnEvent('enquiry.created')
    async handleEnquiryCreatedEvent(event: EnquiryCreatedEvent) {

        const select = ['id', 'first_name', 'last_name', 'email', 'type', 'duration', 'detail', 'phone_code', 'phone_number'];
        const where = { id: event.enquiry_id };
        const relations = {
            city: { columns: ['id', 'name_en', 'name_ar'] },
            car: { columns: ['id', 'name_en', 'name_ar'] }
        };
        const enquiry = await this.enquiryService.getOne(where, select, relations, EnquiryService.LEFT_JOIN);
        const context = {
            enquiry: enquiry,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        await this.mailService.send(
            ENQUIRY_MAIN_RECEPIENT,
            'New Enquiry',
            'enquiry',
            context,
            [MARKETING_RECEPIENT],
            enquiry.id
        )
    }
}
