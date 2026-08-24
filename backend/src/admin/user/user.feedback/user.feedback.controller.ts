import { Controller, Get, Inject, NotFoundException, Param, Query, UseGuards } from '@nestjs/common';
import { UserFeedbackService } from 'src/user.form/user.feedback/user.feedback.service';
import { UserFeedbackDto } from './user.feedback.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/user/feedback')
export class UserFeedbackController {
    constructor(
        @Inject(UserFeedbackService) private userFeedbackService: UserFeedbackService
    ) { }

    private relations_array = [
        'city',
        'user_feedback_source',
        'user_feedback_service',
        'product_knowledge_rating',
        'professionalism_rating',
        'friendliness_rating',
        'timely_response_rating',
        'reliability_rating',
        'cleanliness_rating',
        'overall_rating',
        'revert_reason'
    ]

    @Get()
    async listing(@Query() params: UserFeedbackDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const relations = {};
        for (const relation of this.relations_array) {
            relations[relation] = {
                columns: ['id', `name_${lang}`]
            }
        }

        return await this.userFeedbackService.getAll(params, [], relations, null, true, params.page, params.page_size)
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const lang = LanguageTypes.ENGLISH;
        const relations = {};
        for (const relation of this.relations_array) {
            relations[relation] = {
                columns: ['id', `name_${lang}`]
            }
        }

        const feedback = await this.userFeedbackService.getOne({ id }, [], relations);

        if (!feedback) {
            throw new NotFoundException();
        }

        return feedback;
    }

}
