import { Controller, Get, Inject, Param, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { NewsletterSubscriptionService } from 'src/user.form/newsletter.subscription/newsletter.subscription.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user/newsletter/subscription')
export class NewsletterSubscriptionController {
    constructor(
        @Inject(NewsletterSubscriptionService) private newsletterSubscriptionService: NewsletterSubscriptionService
    ) { }

    @Get()
    async listing(@Param() params: PaginationDto) {
        const response = await this.newsletterSubscriptionService.getAll({}, [], {}, null, true, params.page, params.page_size)

        return response;
    }
}
