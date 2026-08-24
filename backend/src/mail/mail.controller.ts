import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { MailService } from './mail.service';
import { EmailDto } from './email.dto';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('mail')
export class MailController {
    constructor(private readonly mailService: MailService) { }

    /** Reports whether the dedicated HR (M365) transport is initialised. */
    @Get('hr-status')
    hrStatus() {
        return {
            hr_transport_initialised: this.mailService.isHrConfigured(),
            hr_host: process.env.HR_MAIL_HOST || null,
            hr_port: process.env.HR_MAIL_PORT || null,
            hr_user: process.env.HR_MAIL_USERNAME || null,
            hr_from: process.env.HR_MAIL_FROM || null,
            hr_password_set: !!process.env.HR_MAIL_PASSWORD,
        };
    }

    @Post('test')
    @HttpCode(HttpStatus.OK)
    async test(@Body() emailData: EmailDto) {
        try {
            const context = {
                name: 'Route Facile',
                message: emailData.message
            };
            await this.mailService.send(
                emailData.to,
                emailData.subject,
                'test',
                context,
                [],
                null,
                [],
                { throwOnError: true },
            );

            return { message: 'Email sent successfully', to: emailData.to };
        } catch (error: any) {
            return {
                message: 'Failed to send email',
                error: error?.message,
                code: error?.code,
                responseCode: error?.responseCode,
                response: error?.response,
                command: error?.command,
            };
        }
    }

    /**
     * Diagnostic endpoint for the dedicated HR (M365) SMTP transport.
     * Sends the same `test` template via sendHr() and returns the raw SMTP
     * response (or full error) so we can verify deliverability without
     * digging through container logs.
     */
    @Post('test-hr')
    @HttpCode(HttpStatus.OK)
    async testHr(@Body() emailData: EmailDto) {
        try {
            const context = {
                name: 'HR Test',
                message: emailData.message || 'HR SMTP diagnostic test',
            };
            const response: any = await this.mailService.sendHr(
                emailData.to,
                emailData.subject || 'HR SMTP test',
                'test',
                context,
                [],
                null,
                [],
            );
            return {
                message: 'HR email sent successfully',
                to: emailData.to,
                accepted: response?.accepted,
                rejected: response?.rejected,
                response: response?.response,
                messageId: response?.messageId,
            };
        } catch (error: any) {
            return {
                message: 'Failed to send HR email',
                error: error?.message,
                code: error?.code,
                responseCode: error?.responseCode,
                response: error?.response,
                command: error?.command,
            };
        }
    }
}
