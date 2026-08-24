import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingInterview } from 'src/entities/recruiting.interview.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingInterviewService extends BaseService<RecruitingInterview> {
    constructor(@InjectRepository(RecruitingInterview) private interviewRepository: Repository<RecruitingInterview>) {
        super(interviewRepository)
    }
}
