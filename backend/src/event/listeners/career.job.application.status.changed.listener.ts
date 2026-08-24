import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { MailService } from 'src/mail/mail.service';
import { CareerJobApplicationService } from 'src/cms/career.job/career.job.application.service';
import { CareerJobApplicationStatusChangedEvent } from '../events/career.job.application.status.changed.event';
import { ApplicationStatusTypes } from 'src/entities/enums/application.status.type';

@Injectable()
export class CareerJobApplicationStatusChangedListener {
    private readonly logger = new Logger(CareerJobApplicationStatusChangedListener.name);

    private readonly statusMeta: Record<number, { label: string; subject: string; message: string }> = {
        [ApplicationStatusTypes.PENDING]: {
            label: 'Pending',
            subject: 'Your application has been received',
            message: 'We have received your application and it is awaiting review.',
        },
        [ApplicationStatusTypes.REVIEWING]: {
            label: 'Under Review',
            subject: 'Your application is being reviewed',
            message: 'Good news — your application is currently being reviewed by our recruitment team. We will get back to you with the next steps shortly.',
        },
        [ApplicationStatusTypes.SHORTLISTED]: {
            label: 'Shortlisted',
            subject: 'You have been shortlisted',
            message: 'Congratulations! You have been shortlisted for this position. Our team will reach out to you soon to schedule the next steps.',
        },
        [ApplicationStatusTypes.INTERVIEWED]: {
            label: 'Interviewed',
            subject: 'Thank you for attending the interview',
            message: 'Thank you for taking the time to interview with us. Our team is now reviewing the outcome and will share the final decision with you soon.',
        },
        [ApplicationStatusTypes.REJECTED]: {
            label: 'Not Selected',
            subject: 'Update on your application',
            message: 'Thank you for your interest in joining Route Facile. After careful consideration, we have decided to move forward with other candidates for this position. We genuinely appreciate the time and effort you put into your application and encourage you to apply for future opportunities.',
        },
        [ApplicationStatusTypes.HIRED]: {
            label: 'Selected',
            subject: 'Congratulations on joining Route Facile',
            message: 'Congratulations! We are delighted to inform you that you have been selected for this position. Our HR team will contact you shortly with the offer and onboarding details.',
        },
    };

    constructor(
        private readonly mailService: MailService,
        @Inject(CareerJobApplicationService) private readonly careerJobApplicationService: CareerJobApplicationService,
    ) { }

    @OnEvent('career.job.application.status.changed')
    async handle(event: CareerJobApplicationStatusChangedEvent) {
        try {
            const application = await this.careerJobApplicationService.getOne(
                { id: event.application_id },
                ['id', 'first_name', 'last_name', 'email', 'admin_notes'],
                { career_job: { columns: ['id', 'title_en'] } },
            );

            if (!application || !application.email) {
                this.logger.warn(`Skipping status email — no application or email for id=${event.application_id}`);
                return;
            }

            const meta = this.statusMeta[event.new_status];
            if (!meta) {
                this.logger.warn(`No status mapping for status=${event.new_status} (application id=${event.application_id})`);
                return;
            }

            const applicantName = [application.first_name, application.last_name].filter(Boolean).join(' ').trim() || 'Applicant';
            const jobTitle = application.career_job?.title_en || 'the position you applied for';

            const context = {
                applicant_name: applicantName,
                job_title: jobTitle,
                application_id: application.id,
                status_label: meta.label,
                status_message: meta.message,
                admin_notes: application.admin_notes || null,
            };

            await this.mailService.send(
                application.email,
                meta.subject,
                'career_job_application_status_update',
                context,
                [],
                application.id,
                [],
            );
        } catch (error) {
            this.logger.error(`Failed to send status-changed email for application id=${event.application_id}`, error?.stack || error);
        }
    }
}
