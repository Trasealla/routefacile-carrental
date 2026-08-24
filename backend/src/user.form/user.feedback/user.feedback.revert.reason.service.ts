import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserFeedbackRevertReason } from 'src/entities/user.feedback.revert.reason.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserFeedbackRevertReasonService extends BaseService<UserFeedbackRevertReason>{
    constructor(
        @InjectRepository(UserFeedbackRevertReason) repo: Repository<UserFeedbackRevertReason>
    ) {
        super(repo)
    }
}
