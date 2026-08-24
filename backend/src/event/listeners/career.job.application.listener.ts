import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { CAREER_JOB_APPLICATION_RECIPIENT, MARKETING_RECEPIENT } from 'src/config/contants';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobApplicationAttachmentService } from 'src/cms/career.job/career.job.application.attachment.service';
import { CareerJobApplicationEvent } from '../events/career.job.application.event';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { extname } from 'path';

@Injectable()
export class CareerJobApplicationListener {
    private readonly logger = new Logger(CareerJobApplicationListener.name);

    private readonly mimeTypes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png'
    };

    constructor(
        private readonly mailService: MailService,
        @Inject(BookingRepoService) private bookingRepoService: BookingRepoService,
        @Inject(CareerJobApplicationService) private careerJobApplicationService: CareerJobApplicationService,
        @Inject(CareerJobApplicationAttachmentService) private attachmentService: CareerJobApplicationAttachmentService
    ) { }

    @OnEvent('career.job.application')
    async handleEnquiryCreatedEvent(event: CareerJobApplicationEvent) {
        try {
            const select = ['id', 'first_name', 'last_name', 'email', 'phone_code', 'phone_number', 'cv'];
            const where = { id: event.application_id };
            const relations = {
                career_job: { columns: ['id', 'title_en'] }
            };
            const application = await this.careerJobApplicationService.getOne(where, select, relations);
            const context = {
                application,
                file_server: process.env.FILE_SERVER,
                links: this.bookingRepoService.emailLinks()
            };

            // Get all attachments for this application
            const attachmentsResult = await this.attachmentService.getAll({ career_job_application_id: event.application_id });
            const attachmentFiles = (attachmentsResult.data || []);

            const attachments = attachmentFiles.map(att => {
                const ext = extname(att.file_name).toLowerCase();
                return {
                    filename: att.original_name,
                    path: `./uploads/job-applications/${application.career_job.id}/${att.file_name}`,
                    contentType: this.mimeTypes[ext] || 'application/octet-stream'
                };
            });

            await this.mailService.send(
                CAREER_JOB_APPLICATION_RECIPIENT,
                'Job Application',
                'career_job_application',
                context,
                [MARKETING_RECEPIENT],
                application.id,
                attachments
            )

            // Send a confirmation email to the applicant so they know we received the CV.
            // Failure here must NOT roll back / fail the internal HR notification above,
            // so we wrap it in its own try/catch.
            if (application?.email) {
                try {
                    await this.mailService.send(
                        application.email,
                        'We received your application - Route Facile',
                        'career_job_application_received',
                        context,
                        [],
                        application.id,
                        []
                    );
                } catch (applicantMailError) {
                    this.logger.error(
                        `Failed to send applicant confirmation email for application ID: ${event.application_id}`,
                        applicantMailError?.stack || applicantMailError,
                    );
                }
            } else {
                this.logger.warn(`No applicant email on file for application ID: ${event.application_id}; skipping confirmation email.`);
            }
        } catch (error) {
            this.logger.error(`Failed to process career job application event for application ID: ${event.application_id}`, error.stack);
        }
    }
}
