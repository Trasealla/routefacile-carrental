import { Controller, Get, Inject, Param, Query, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { MailService } from './mail.service';
import { MailService as MailSenderService } from '../../mail/mail.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/mail')
export class MailController {

    constructor(@Inject(MailService) private mailService: MailService,
        private mailerService: MailerService) { }

    @Get()
    async index(@Query() params: PaginationDto) {

        const query = `SELECT * FROM mail_responses WHERE subject NOT LIKE "%Error%" ORDER BY id DESC LIMIT ${params.page_size} OFFSET ${params.page_size * (params.page - 1)}`;

        return await this.mailService.executeRawQuery(query);
    }

    @Get('send/:id')
    async send(@Param('id') id: number) {

        const mail_response = await this.mailService.getOne({ id });

        return await this.mailerService.sendMail(
            {
                to: mail_response.to,
                subject: mail_response.subject,
                html: mail_response.template,
                cc: mail_response.cc
            }
        )
    }
}
