import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Admin } from 'src/entities/admin.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class AdminService extends BaseService<Admin> {

    constructor(
        @InjectRepository(Admin) private adminRepository: Repository<Admin>
    ) {
        super(adminRepository)
    }

    /**
     * Find an admin by email INCLUDING soft-deleted rows.
     * The MySQL unique index on `email` does not ignore soft-deleted rows,
     * so re-creating an HR user with the email of a previously-deleted admin
     * would fail with ER_DUP_ENTRY unless we restore that row instead.
     */
    async findByEmailWithDeleted(email: string): Promise<Admin | null> {
        return this.adminRepository
            .createQueryBuilder('a')
            .withDeleted()
            .where('a.email = :email', { email })
            .getOne();
    }

    /** Restore (clear deleted_at on) a soft-deleted admin row. */
    async restoreAdmin(id: number): Promise<void> {
        await this.adminRepository.restore(id);
    }

    /**
     * Paginated listing of HR staff (hr_manager / hr_recruitment).
     * Uses a dedicated query builder because BaseService.getAll() cannot
     * safely render a typed `IN (...)` clause for string enum values.
     */
    async listHrStaff(opts: {
        types: string[];
        status?: number;
        search?: string;
        type?: string;
        page: number;
        page_size: number;
    }) {
        const qb = this.adminRepository.createQueryBuilder('a')
            .select([
                'a.id', 'a.type', 'a.first_name', 'a.last_name', 'a.email',
                'a.country_code', 'a.phone_number', 'a.status',
                'a.must_reset_password', 'a.last_login_at',
                'a.created_at', 'a.updated_at',
            ])
            .where('a.deleted_at IS NULL');

        if (opts.type) {
            qb.andWhere('a.type = :type', { type: opts.type });
        } else {
            qb.andWhere('a.type IN (:...types)', { types: opts.types });
        }

        if (opts.status !== undefined) {
            qb.andWhere('a.status = :status', { status: opts.status });
        }

        if (opts.search) {
            qb.andWhere(
                '(a.email LIKE :s OR a.first_name LIKE :s OR a.last_name LIKE :s OR a.phone_number LIKE :s)',
                { s: `%${opts.search}%` },
            );
        }

        const total_records = await qb.clone().getCount();

        const data = await qb
            .orderBy('a.created_at', 'DESC')
            .skip((opts.page - 1) * opts.page_size)
            .take(opts.page_size)
            .getMany();

        return {
            data,
            pagination: {
                page: opts.page,
                page_size: opts.page_size,
                total_records,
                total_pages: Math.ceil(total_records / opts.page_size),
            },
        };
    }
}
