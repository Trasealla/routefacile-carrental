import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { RecruitingChannelPostingService } from 'src/recruiting/recruiting.channel.posting.service';
import { RecruitingChannelPostingDto, RecruitingChannelPostingFilterDto, RecruitingChannelPostingUpdateDto } from './channel-posting.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/channel-posting')
export class RecruitingChannelPostingController {
    constructor(
        @Inject(RecruitingChannelPostingService) private channelPostingService: RecruitingChannelPostingService,
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto, @Query() filter: RecruitingChannelPostingFilterDto) {
        const where: any = {};
        if (filter.career_job_id) {
            where.career_job_id = filter.career_job_id;
        }
        if (filter.channel_name) {
            where.channel_name = filter.channel_name;
        }

        return await this.channelPostingService.getAll(
            where,
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
            true,
            params.page,
            params.page_size,
            { column: 'entity.created_at', order: 'DESC' },
        );
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const response = await this.channelPostingService.getOne(
            { id },
            [],
            { career_job: { columns: ['id', 'title_en', 'title_ar'] } },
            'left',
        );

        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    async store(@Body() body: RecruitingChannelPostingDto, @Request() req: any) {
        body.created_by = req.user.id;
        return await this.channelPostingService.insert(body);
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: RecruitingChannelPostingUpdateDto, @Request() req: any) {
        const response = await this.channelPostingService.getOne({ id });
        if (response) {
            body.updated_by = req.user.id;
            return await this.channelPostingService.update({ id }, body);
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req: any) {
        const response = await this.channelPostingService.getOne({ id });
        if (response) {
            await this.channelPostingService.update({ id }, { deleted_by: req.user.id });
            return await this.channelPostingService.softDelete({ id });
        }
        throw new NotFoundException();
    }
}
