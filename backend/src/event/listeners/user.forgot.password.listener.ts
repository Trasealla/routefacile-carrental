import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { UserForgotPasswordEvent } from '../events/user.forgot.password.event';
import { UserForgotPasswordService } from 'src/user/user.forgot.password.service';
import { SmsService } from 'src/mail/sms.service';
import { FORGOT_PASSWORD } from 'src/mail/sms/sms_texts';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class UserForgotPasswordListener {
    constructor(
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(UserForgotPasswordService) private userForgotPasswordService: UserForgotPasswordService
    ) { }

    @OnEvent('user.forgot.password')
    async handleUserForgotPasswordEvent(event: UserForgotPasswordEvent) {

        const where = { user_id: event.user_id, status: UserForgotPasswordService.ACTIVE };

        const forgot_password = await this.userForgotPasswordService.getOne(where, [], { user: { columns: ['id', 'first_name', 'last_name', 'email', 'phone_code', 'phone_number'] } });

        const context = {
            forgot_password: forgot_password,
            file_server: process.env.FILE_SERVER,
            links: this.bookingRepoService.emailLinks()
        };

        const user = forgot_password.user;

        await this.mailService.send(
            forgot_password.user.email,
            'Forgot Password',
            'user_forgot_password',
            context,
            [],
            user.id
        )

        await this.smsService.send(user.phone_code, user.phone_number, FORGOT_PASSWORD.replace('[otp]', forgot_password.otp), 'forgot_password', user.id)
    }
}
