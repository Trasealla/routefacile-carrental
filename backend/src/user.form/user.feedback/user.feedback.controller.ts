import { Body, Controller, Get, Inject, Param, Post, UseGuards } from '@nestjs/common';
import { UserFeedbackService } from './user.feedback.service';
import { UserFeedbackSourceService } from './user.feedback.source.service';
import { UserFeedbackServiceService } from './user.feedback.service.service';
import { UserFeedbackRevertReasonService } from './user.feedback.revert.reason.service';
import { UserFeedbackRatingService } from './user.feedback.rating.service';
import { UserFeedbackOverallRatingService } from './user.feedback.overall.rating.service';
import { UserFeedbackDto } from './user.feedback.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyJwtAuthGuard } from 'src/auth/guard/apikey-jwt-auth.gaurd';
import { LangDto } from 'src/dtos/lang.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { UserFeedbackServiceCategoryService } from './user.feedback.service.category.service';

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('user-forms')
@UseGuards(ApiKeyJwtAuthGuard)
@Controller('user/feedback')
export class UserFeedbackController {

    constructor(
        @Inject(UserFeedbackService) private userFeedbackService: UserFeedbackService,
        @Inject(UserFeedbackSourceService) private userFeedbackSourceService: UserFeedbackSourceService,
        @Inject(UserFeedbackServiceService) private userFeedbackServiceService: UserFeedbackServiceService,
        @Inject(UserFeedbackRevertReasonService) private userFeedbackRevertReasonService: UserFeedbackRevertReasonService,
        @Inject(UserFeedbackRatingService) private userFeedbackRatingService: UserFeedbackRatingService,
        @Inject(UserFeedbackOverallRatingService) private userFeedbackOverallRatingService: UserFeedbackOverallRatingService,
        @Inject(UserFeedbackServiceCategoryService) private userFeedbackServiceCategoryService: UserFeedbackServiceCategoryService
    ) { }

    @Get('source')
    async sourceListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackSourceService.getAll({}, select);

        return this.userFeedbackSourceService.removePostfix(response);
    }

    @Get('service')
    async serviceListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackServiceService.getAll({}, select);

        return this.userFeedbackServiceService.removePostfix(response);
    }

    @Get('service/category')
    async serviceCategoryListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackServiceCategoryService.getAll({}, select);

        return this.userFeedbackServiceCategoryService.removePostfix(response);
    }

    @Get('rating')
    async ratingListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackRatingService.getAll({}, select);

        return this.userFeedbackRatingService.removePostfix(response);
    }

    @Get('overall/rating')
    async overallRatingListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackOverallRatingService.getAll({}, select);

        return this.userFeedbackOverallRatingService.removePostfix(response);
    }

    @Get('revert/reason')
    async revertReasonListig(@Param() params: LangDto) {
        const lang = params.lang || LanguageTypes.ENGLISH;
        const select = ['id', `name_${lang}`]
        const response = await this.userFeedbackRevertReasonService.getAll({}, select);

        return this.userFeedbackRevertReasonService.removePostfix(response);
    }

    @Post()
    async store(@Body() body: UserFeedbackDto) {
        return await this.userFeedbackService.insert(body);
    }
}
