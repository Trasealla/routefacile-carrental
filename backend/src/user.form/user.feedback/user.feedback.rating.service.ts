import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackRating } from 'src/entities/user.feedback.rating.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackRatingService extends BaseService<UserFeedbackRating>{
    constructor(
        @InjectRepository(UserFeedbackRating) repo: Repository<UserFeedbackRating>
    ) {
        super(repo)
    }
}
