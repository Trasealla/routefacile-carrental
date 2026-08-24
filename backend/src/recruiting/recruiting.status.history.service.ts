import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingStatusHistory } from 'src/entities/recruiting.status.history.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingStatusHistoryService extends BaseService<RecruitingStatusHistory> {
    constructor(@InjectRepository(RecruitingStatusHistory) private statusHistoryRepository: Repository<RecruitingStatusHistory>) {
        super(statusHistoryRepository)
    }
}
