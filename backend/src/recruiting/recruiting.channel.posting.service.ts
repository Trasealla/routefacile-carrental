import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingChannelPosting } from 'src/entities/recruiting.channel.posting.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingChannelPostingService extends BaseService<RecruitingChannelPosting> {
    constructor(@InjectRepository(RecruitingChannelPosting) private postingRepository: Repository<RecruitingChannelPosting>) {
        super(postingRepository)
    }
}
