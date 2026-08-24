import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EnquiryCreatedEvent } from '../events/enquiry.created.event';
import { OfferEnquiryService } from 'src/user.form/offer.enquiry/offer.enquiry.service';
import { MARKETING_RECEPIENT, OFFER_ENQUIRY_MAIN_RECEPIENT } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class OfferEnquiryCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(OfferEnquiryService) private offerEnquiryService: OfferEnquiryService
    ) { }

    @OnEvent('offer.enquiry.created')
    async handleEnquiryCreatedEvent(event: EnquiryCreatedEvent) {
        const select = ['id', 'first_name', 'last_name', 'email', 'address', 'phone_code', 'phone_number'];
        const where = { id: event.enquiry_id };
        const relations = {
            offer: { columns: ['id', 'title_en'] }
        };
        const offer_enquiry = await this.offerEnquiryService.getOne(where, select, relations);
        const context = {
            offer_enquiry: offer_enquiry,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        await this.mailService.send(
            OFFER_ENQUIRY_MAIN_RECEPIENT,
            "New Offer Enquiry",
            'offer_enquiry',
            context,
            [MARKETING_RECEPIENT],
            offer_enquiry.id
        )
    }
}
