import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { CvScreeningService } from './cv.screening.service';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin', 'hr_manager', 'hr_recruitment')
@Controller('admin/recruiting/screening')
export class CvScreeningController {
    constructor(private readonly cvScreeningService: CvScreeningService) { }

    /**
     * Re-run AI screening for a single application.
     * Use after editing keywords or after re-uploading the CV.
     */
    @Post('rescreen/:id')
    async rescreen(@Param('id') id: number) {
        return await this.cvScreeningService.screen(Number(id));
    }

    /**
     * Re-run AI screening for every application of a given job.
     * Use after bulk-importing keywords or after a major keyword overhaul.
     */
    @Post('rescreen-job/:jobId')
    async rescreenJob(@Param('jobId') jobId: number) {
        return await this.cvScreeningService.screenJob(Number(jobId));
    }

    /**
     * Get the persisted AI screening details for an application
     * (matched/missing keywords, score, status, screened_at).
     */
    @Get(':id')
    async getDetails(@Param('id') id: number) {
        return await this.cvScreeningService.getDetails(Number(id));
    }
}
