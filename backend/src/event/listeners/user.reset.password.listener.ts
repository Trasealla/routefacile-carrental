import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { UserService } from 'src/user/user.service';
import { UserResetPasswordEvent } from '../events/user.reset.password.event';
import { SmsService } from 'src/mail/sms.service';
import { RESET_PASSWORD } from 'src/mail/sms/sms_texts';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class UserResetPasswordListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(UserService) private userService: UserService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        private readonly smsService: SmsService,
    ) { }

    @OnEvent('user.reset.password')
    async handleUserResetPasswordEvent(event: UserResetPasswordEvent) {

        const where = { id: event.user_id };

        const user = await this.userService.getOne(where);

        const context = {
            user,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        }

        await this.mailService.send(
            user.email,
            'Reset Password Confirmation',
            'user_reset_password',
            context,
            [],
            user.id
        )

        await this.smsService.send(user.phone_code, user.phone_number, RESET_PASSWORD, 'reset_password', user.id)
    }
}
