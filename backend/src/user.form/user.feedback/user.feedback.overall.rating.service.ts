import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackOverallRating } from 'src/entities/user.feedback.overall.rating.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackOverallRatingService extends BaseService<UserFeedbackOverallRating> {
    constructor(
        @InjectRepository(UserFeedbackOverallRating) repo: Repository<UserFeedbackOverallRating>
    ) {
        super(repo)
    }
}
