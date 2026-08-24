import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { UserRegisteredEvent } from '../events/user.registered.event';
import { UserService } from 'src/user/user.service';
import { SmsService } from 'src/mail/sms.service';
import { REGISTER_USER } from 'src/mail/sms/sms_texts';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class UserRegisteredListener {
    constructor(
        private readonly mailService: MailService,
        private readonly smsService: SmsService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(UserService) private userService: UserService
    ) { }

    @OnEvent('user.registered')
    async handleUserRegisteredEvent(event: UserRegisteredEvent) {
        try {
            const where = { id: event.user_id };

            const user = await this.userService.getOne(where);
            
            if (!user) {
                console.error(`[UserRegisteredListener] User not found for id: ${event.user_id}`);
                return;
            }
            
            const context = {
                user: user,
                register_otp: user.register_otp,
                file_server: process.env.FILE_SERVER,
                classic: event.classic,
                links: this.bookingRepoService.emailLinks()
            };

            // Send SMS - don't let SMS failure block email sending
            if (event.classic) {
                try {
                    const sms_text = REGISTER_USER.replace('[otp]', user.register_otp)
                    await this.smsService.send(user.phone_code, user.phone_number, sms_text, 'register', user.id)
                } catch (smsError) {
                    console.error(`[UserRegisteredListener] SMS failed for user ${user.id}:`, smsError);
                }
            }

            // Send Email - separate try-catch to ensure it runs even if SMS fails
            try {
                await this.mailService.send(
                    user.email,
                    'Welcome to Route Facile',
                    'user_register',
                    context,
                    [],
                    user.id
                )
                console.log(`[UserRegisteredListener] Email sent successfully for user ${user.id} to ${user.email}`);
            } catch (emailError) {
                console.error(`[UserRegisteredListener] Email failed for user ${user.id}:`, emailError);
            }
        } catch (error) {
            console.error(`[UserRegisteredListener] Error processing user registration for id ${event.user_id}:`, error);
        }
    }
}
