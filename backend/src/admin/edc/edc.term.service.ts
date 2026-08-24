import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EdcTerm } from 'src/entities/edc.term.entity';
import { BaseService } from 'src/service/base.service';
import { Repository, IsNull } from 'typeorm';
import { ReorderTermDto } from './edc.term.dto';

@Injectable()
export class EdcTermService extends BaseService<EdcTerm> {
    constructor(
        @InjectRepository(EdcTerm) private edcTermRepository: Repository<EdcTerm>
    ) {
        super(edcTermRepository);
    }

    /**
     * Get all terms (including inactive) for admin
     */
    async getAllTerms(): Promise<EdcTerm[]> {
        return await this.edcTermRepository.find({
            where: { deleted_at: IsNull() },
            order: { sort_order: 'ASC', id: 'ASC' }
        });
    }

    /**
     * Get only active terms (for public API)
     */
    async getActiveTerms(): Promise<EdcTerm[]> {
        return await this.edcTermRepository.find({
            where: { is_active: true, deleted_at: IsNull() },
            order: { sort_order: 'ASC', id: 'ASC' }
        });
    }

    /**
     * Get term by ID
     */
    async getTermById(id: number): Promise<EdcTerm | null> {
        return await this.edcTermRepository.findOne({
            where: { id, deleted_at: IsNull() }
        });
    }

    /**
     * Create a new term with auto sort order
     */
    async createTerm(data: Partial<EdcTerm>): Promise<EdcTerm> {
        // Get max sort order
        const maxSortResult = await this.edcTermRepository
            .createQueryBuilder('term')
            .select('MAX(term.sort_order)', 'maxSort')
            .getRawOne();
        
        const nextSortOrder = (maxSortResult?.maxSort || 0) + 1;
        
        const term = this.edcTermRepository.create({
            ...data,
            sort_order: nextSortOrder
        });
        
        return await this.edcTermRepository.save(term);
    }

    /**
     * Update a term
     */
    async updateTerm(id: number, data: Partial<EdcTerm>): Promise<EdcTerm | null> {
        await this.edcTermRepository.update({ id }, data);
        return await this.getTermById(id);
    }

    /**
     * Soft delete a term
     */
    async deleteTerm(id: number): Promise<boolean> {
        const result = await this.edcTermRepository.softDelete({ id });
        return result.affected > 0;
    }

    /**
     * Reorder terms
     */
    async reorderTerms(order: ReorderTermDto[]): Promise<boolean> {
        for (const item of order) {
            await this.edcTermRepository.update(
                { id: item.id },
                { sort_order: item.sort_order }
            );
        }
        return true;
    }

    /**
     * Toggle term active status
     */
    async toggleTermStatus(id: number): Promise<EdcTerm | null> {
        const term = await this.getTermById(id);
        if (!term) return null;

        await this.edcTermRepository.update(
            { id },
            { is_active: !term.is_active }
        );
        
        return await this.getTermById(id);
    }
}







