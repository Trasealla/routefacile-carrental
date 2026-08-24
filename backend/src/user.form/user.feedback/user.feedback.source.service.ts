import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackSource } from 'src/entities/user.feedback.source.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackSourceService  extends BaseService<UserFeedbackSource>{
    constructor(
        @InjectRepository(UserFeedbackSource) repo: Repository<UserFeedbackSource>
    ) {
        super(repo)
    }
}