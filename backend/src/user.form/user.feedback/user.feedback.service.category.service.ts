import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackServiceCategory } from 'src/entities/user.feedback.service.category.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackServiceCategoryService extends BaseService<UserFeedbackServiceCategory> {
    constructor(
        @InjectRepository(UserFeedbackServiceCategory) repo: Repository<UserFeedbackServiceCategory>
    ) {
        super(repo)
    }
}