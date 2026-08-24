import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';

import { LOST_FOUND_REQUEST_MAIN_RECEPIENT } from 'src/config/contants';
import { LostFoundRequestService } from 'src/user.form/lost.found.request/lost.found.request.service';
import { LostFoundRequestCreatedEvent } from '../events/lost.found.request.created.event';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class LostFoundRequestCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(LostFoundRequestService) private lostFoundRequestService: LostFoundRequestService
    ) { }

    @OnEvent('lost.found.request.created')
    async handleEnquiryCreatedEvent(event: LostFoundRequestCreatedEvent) {
        const select = ['id', 'first_name', 'last_name', 'email', 'phone_code',
            'phone_number', 'city_id', 'detail', 'reference_number'];
        const where = { id: event.id };
        const relations = {
            city: { columns: ['name_en'] }
        };
        const entity = await this.lostFoundRequestService.getOne(where, select, relations);

        const context = {
            entity: entity,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        await this.mailService.send(
            entity.email,
            'Lost and Found Request',
            'lost_found_request',
            context,
            [LOST_FOUND_REQUEST_MAIN_RECEPIENT],
            entity.id
        )
    }
}
