import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Patch, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { EdcTermService } from './edc.term.service';
import { CreateEdcTermDto, UpdateEdcTermDto, ReorderTermsDto } from './edc.term.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/edc/terms')
export class EdcTermController {
    constructor(
        @Inject(EdcTermService) private edcTermService: EdcTermService
    ) {}

    /**
     * GET /api/admin/edc/terms
     * Get all terms (including inactive)
     */
    @Get()
    async getAllTerms() {
        const terms = await this.edcTermService.getAllTerms();
        
        return {
            success: true,
            data: terms
        };
    }

    /**
     * GET /api/admin/edc/terms/:id
     * Get single term by ID
     */
    @Get(':id')
    async getTermById(@Param('id') id: number) {
        const term = await this.edcTermService.getTermById(id);
        
        if (!term) {
            throw new NotFoundException({
                success: false,
                error: 'Term not found'
            });
        }

        return {
            success: true,
            data: term
        };
    }

    /**
     * POST /api/admin/edc/terms
     * Create new term
     */
    @Post()
    async createTerm(
        @Body() body: CreateEdcTermDto,
        @Request() req
    ) {
        body.created_by = req.user.id;

        if (!body.text_en || body.text_en.trim() === '') {
            return {
                success: false,
                error: 'Validation error',
                details: { text_en: 'English text is required' }
            };
        }

        const term = await this.edcTermService.createTerm(body as any);

        return {
            success: true,
            message: 'Term created successfully',
            data: term
        };
    }

    /**
     * PUT /api/admin/edc/terms/:id
     * Update existing term
     */
    @Put(':id')
    async updateTerm(
        @Param('id') id: number,
        @Body() body: UpdateEdcTermDto,
        @Request() req
    ) {
        const existingTerm = await this.edcTermService.getTermById(id);
        
        if (!existingTerm) {
            throw new NotFoundException({
                success: false,
                error: 'Term not found'
            });
        }

        body.updated_by = req.user.id;
        const term = await this.edcTermService.updateTerm(id, body as any);

        return {
            success: true,
            message: 'Term updated successfully',
            data: term
        };
    }

    /**
     * DELETE /api/admin/edc/terms/:id
     * Soft delete a term
     */
    @Delete(':id')
    async deleteTerm(@Param('id') id: number) {
        const existingTerm = await this.edcTermService.getTermById(id);
        
        if (!existingTerm) {
            throw new NotFoundException({
                success: false,
                error: 'Term not found'
            });
        }

        await this.edcTermService.deleteTerm(id);

        return {
            success: true,
            message: 'Term deleted successfully'
        };
    }

    /**
     * PUT /api/admin/edc/terms/reorder
     * Reorder terms
     */
    @Put('reorder')
    async reorderTerms(@Body() body: ReorderTermsDto) {
        await this.edcTermService.reorderTerms(body.order);

        return {
            success: true,
            message: 'Terms reordered successfully'
        };
    }

    /**
     * PATCH /api/admin/edc/terms/:id/toggle
     * Toggle term active status
     */
    @Patch(':id/toggle')
    async toggleTermStatus(@Param('id') id: number) {
        const term = await this.edcTermService.toggleTermStatus(id);
        
        if (!term) {
            throw new NotFoundException({
                success: false,
                error: 'Term not found'
            });
        }

        return {
            success: true,
            message: 'Term status toggled',
            data: {
                id: term.id,
                is_active: term.is_active
            }
        };
    }
}







