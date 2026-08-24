import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Broker } from 'src/entities/broker.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BrokerService extends BaseService<Broker> {

    constructor(
        @InjectRepository(Broker) private brokerRepo: Repository<Broker>
    ) {
        super(brokerRepo)
    }

    async getAllFiltered(search: string, status: number, page: number, page_size: number) {
        const query = this.brokerRepo.createQueryBuilder('broker');

        if (search) {
            query.andWhere('(broker.name LIKE :search OR broker.username LIKE :search OR broker.contact_email LIKE :search)', { search: `%${search}%` });
        }

        if (status !== undefined && status !== null) {
            query.andWhere('broker.status = :status', { status });
        }

        query.orderBy('broker.created_at', 'DESC');

        const total_records = await query.getCount();

        query.skip((page - 1) * page_size).take(page_size);

        const data = await query.getMany();

        return { data, total_records };
    }

    async findByUsername(username: string): Promise<Broker> {
        return await this.brokerRepo.findOne({ where: { username } });
    }
}
