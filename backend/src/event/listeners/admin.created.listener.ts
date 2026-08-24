import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { AdminCreatedEvent } from '../events/admin.created.event';
import { AdminService } from 'src/admin/admin.service';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';

@Injectable()
export class AdminCreatedListener {
    constructor(
        private readonly mailService: MailService,
        @Inject(AdminService) private adminService: AdminService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
    ) { }

    @OnEvent('admin.created')
    async handleAdminCreatedEvent(event: AdminCreatedEvent) {
        try {
            const admin = await this.adminService.getOne({ id: event.admin_id });

            if (!admin) {
                console.error(`[AdminCreatedListener] Admin not found for id: ${event.admin_id}`);
                return;
            }

            const baseUrl = process.env.ADMIN_PORTAL_URL || 'https://routefacilecarrental.com/admin';
            const isHr = admin.type === 'hr_manager' || admin.type === 'hr_recruitment';
            const portalUrl = `${baseUrl.replace(/\/$/, '')}${isHr ? '/hr/login' : '/login'}`;

            const context = {
                admin: admin,
                temp_password: event.temp_password,
                portal_url: portalUrl,
                file_server: process.env.FILE_SERVER,
                links: this.bookingRepoService.emailLinks()
            };

            await this.mailService.sendHr(
                admin.email,
                'Welcome to Route Facile HR Portal - Your Account is Ready',
                'admin_created',
                context,
                [],
                admin.id
            );

            console.log(`[AdminCreatedListener] Welcome email sent to ${admin.email}`);
        } catch (error) {
            console.error(`[AdminCreatedListener] Failed to send welcome email:`, error);
        }
    }
}
