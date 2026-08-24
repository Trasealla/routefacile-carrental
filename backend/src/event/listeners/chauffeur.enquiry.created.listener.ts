import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { EnquiryCreatedEvent } from '../events/enquiry.created.event';
import { CHAUFFEUR_ENQUIRY_RECPIENT, CHAUFFEUR_ENQUIRY_RECPIENT_CC } from 'src/config/contants';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { ChauffeurEnquiryService } from 'src/user.form/chauffeur.enquiry/chauffeur.enquiry.service';

@Injectable()
export class ChauffeurEnquiryCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(ChauffeurEnquiryService) private chauffeurEnquiryService: ChauffeurEnquiryService
    ) { }

    @OnEvent('chauffeur.enquiry.created')
    async handleEnquiryCreatedEvent(event: EnquiryCreatedEvent) {
        const select = ['id', 'name', 'email', 'details', 'phone_code', 'phone_number', 'car', 'service_type', 'pickup_date_time', 'pickup_address', 'dropoff_date_time', 'dropoff_address', 'passengers', 'luggage_bags', 'child_seats', 'pickup_coordinates', 'dropoff_coordinates'];
        const where = { id: event.enquiry_id };

        const chauffeur_enquiry = await this.chauffeurEnquiryService.getOne(where, select);
        const context = {
            chauffeur_enquiry: chauffeur_enquiry,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };
        
        await this.mailService.send(
            CHAUFFEUR_ENQUIRY_RECPIENT,
            "Chauffeur Enquiry",
            'chauffeur_enquiry',
            context,
            CHAUFFEUR_ENQUIRY_RECPIENT_CC,
            chauffeur_enquiry.id
        )
    }
}
