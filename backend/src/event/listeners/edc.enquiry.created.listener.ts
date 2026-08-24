import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EdcEnquiryCreatedEvent } from '../events/edc.enquiry.created.event';
import { 
    EDC_ENQUIRY_RECPIENT_AUH, 
    EDC_ENQUIRY_RECPIENT_AUH_CC, 
    EDC_ENQUIRY_RECPIENT_DXB, 
    EDC_ENQUIRY_RECPIENT_DXB_CC,
    MARKETING_RECEPIENT 
} from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { EdcEnquiryService } from 'src/user.form/edc.enquiry/edc.enquiry.service';

@Injectable()
export class EdcEnquiryCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(EdcEnquiryService) private edcEnquiryService: EdcEnquiryService
    ) { }

    @OnEvent('edc.enquiry.created')
    async handleEnquiryCreatedEvent(event: EdcEnquiryCreatedEvent) {
        const select = ['id', 'name', 'email', 'details', 'phone_code', 'phone_number', 'car_id', 'city_id', 'duration', 'edc_student_id', 'promo_code'];
        const where = { id: event.enquiry_id };
        const relations = {
            car: {
                columns: ['id', 'name_en']
            },
            city: {
                columns: ['id', 'name_en']
            }
        };

        const edc_enquiry = await this.edcEnquiryService.getOne(where, select, relations, EdcEnquiryService.LEFT_JOIN);
        
        if (!edc_enquiry) {
            console.error(`EDC Enquiry not found: ${event.enquiry_id}`);
            return;
        }

        const context = {
            edc_enquiry: edc_enquiry,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        // Dubai cities: 1, 3, 6, 7
        const isDubai = [1, 3, 6, 7].includes(edc_enquiry.city_id);

        await this.mailService.send(
            isDubai ? EDC_ENQUIRY_RECPIENT_DXB : EDC_ENQUIRY_RECPIENT_AUH,
            "EDC Member Enquiry",
            'edc_enquiry', // Template name - needs to be created
            context,
            [isDubai ? EDC_ENQUIRY_RECPIENT_DXB_CC : EDC_ENQUIRY_RECPIENT_AUH_CC, MARKETING_RECEPIENT],
            edc_enquiry.id
        )
    }
}




