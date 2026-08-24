import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackService } from 'src/entities/user.feedback.service.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackServiceService extends BaseService<UserFeedbackService>{
    constructor(
        @InjectRepository(UserFeedbackService) repo: Repository<UserFeedbackService>
    ) {
        super(repo)
    }
}