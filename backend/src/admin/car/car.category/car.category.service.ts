import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CarCategory } from 'src/entities/car.category.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CarCategoryService extends BaseService<CarCategory> {
    constructor(
        @InjectRepository(CarCategory) repo: Repository<CarCategory>
    ) {
        super(repo)
    }

    async reorder(orderedIds: number[]): Promise<any> {
        const queryRunner = this.repository.manager.connection.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            for (let i = 0; i < orderedIds.length; i++) {
                await queryRunner.manager.update(CarCategory, { id: orderedIds[i] }, { sort_order: i + 1 });
            }
            await queryRunner.commitTransaction();
            return { status: 'success' };
        } catch (error) {
            await queryRunner.rollbackTransaction();
            return { status: 'error', error: { message: error.message } };
        } finally {
            await queryRunner.release();
        }
    }
}
