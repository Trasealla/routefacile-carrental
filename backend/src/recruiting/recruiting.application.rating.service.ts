import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingApplicationRating } from 'src/entities/recruiting.application.rating.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingApplicationRatingService extends BaseService<RecruitingApplicationRating> {
    constructor(@InjectRepository(RecruitingApplicationRating) private ratingRepository: Repository<RecruitingApplicationRating>) {
        super(ratingRepository)
    }
}
