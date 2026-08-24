import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedback } from 'src/entities/user.feedback.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackService extends BaseService<UserFeedback>{
    constructor(
        @InjectRepository(UserFeedback) repo: Repository<UserFeedback>
    ) {
        super(repo)
    }
}
