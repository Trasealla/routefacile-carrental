import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingScreeningKeyword } from 'src/entities/recruiting.screening.keyword.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingScreeningKeywordService extends BaseService<RecruitingScreeningKeyword> {
    constructor(@InjectRepository(RecruitingScreeningKeyword) private keywordRepository: Repository<RecruitingScreeningKeyword>) {
        super(keywordRepository)
    }
}
