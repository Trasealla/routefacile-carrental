import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RecruitingApplicationRatingService } from 'src/recruiting/recruiting.application.rating.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { RecruitingApplicationRatingDto, RecruitingApplicationRatingUpdateDto } from './rating.dto';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';

class RatingFilterDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    application_id: number;
}

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/rating')
export class RecruitingApplicationRatingController {
    constructor(
        @Inject(RecruitingApplicationRatingService) private ratingService: RecruitingApplicationRatingService,
    ) { }

    @Get()
    async listing(@Query() filters: RatingFilterDto) {
        const where: any = {};
        if (filters.application_id) where.application_id = filters.application_id;

        return await this.ratingService.getAll(
            where,
            [],
            {
                rated_by_admin: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left',
            false,
            1,
            100,
            { column: 'entity.created_at', order: 'DESC' }
        );
    }

    @Get('average/:applicationId')
    async averageRating(@Param('applicationId') applicationId: number) {
        const repo = this.ratingService['repository'];
        const result = await repo.createQueryBuilder('entity')
            .select('AVG(entity.rating)', 'average_rating')
            .addSelect('COUNT(entity.id)', 'total_ratings')
            .where('entity.application_id = :applicationId', { applicationId })
            .getRawOne();

        return {
            application_id: applicationId,
            average_rating: result.average_rating ? parseFloat(result.average_rating).toFixed(1) : null,
            total_ratings: parseInt(result.total_ratings),
        };
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.ratingService.getOne(
            { id },
            [],
            {
                application: { columns: ['id', 'first_name', 'last_name', 'email'] },
                rated_by_admin: { columns: ['id', 'first_name', 'last_name'] },
            },
            'left'
        );
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingApplicationRatingDto, @Request() req) {
        body.rated_by = req.user.id;
        return await this.ratingService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: RecruitingApplicationRatingUpdateDto, @Request() req) {
        const response = await this.ratingService.getOne({ id });
        if (response) {
            return await this.ratingService.update({ id }, body);
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const response = await this.ratingService.getOne({ id });
        if (response) {
            return await this.ratingService.update({ id }, {}); // Soft approach - could also hard delete
        }
        throw new NotFoundException();
    }
}
