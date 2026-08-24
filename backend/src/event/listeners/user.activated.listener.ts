import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { UserActivatedEvent } from '../events/user.activated.event';
import { SmsService } from 'src/mail/sms.service';
import { CONFIRM_ACCOUNT } from 'src/mail/sms/sms_texts';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class UserActivatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(UserService) private userService: UserService,
        private readonly smsService: SmsService
    ) { }

    @OnEvent('user.activated')
    async handleUserActivatedEvent(event: UserActivatedEvent) {

        const where = { id: event.user_id };

        const user = await this.userService.getOne(where);
        const context = {
            user: user,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        await this.smsService.send(user.phone_code, user.phone_number, CONFIRM_ACCOUNT, 'account_confirm', user.id)

        await this.mailService.send(
            user.email,
            'Route Facile Account Confirmation',
            'user_active',
            context,
            [],
            user.id
        )
    }
}
