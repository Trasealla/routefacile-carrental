import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CareerJobApplicationAttachment } from 'src/entities/career.job.application.attachments.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class CareerJobApplicationAttachmentService extends BaseService<CareerJobApplicationAttachment> {

    constructor(@InjectRepository(CareerJobApplicationAttachment) private attachmentRepository: Repository<CareerJobApplicationAttachment>) {
        super(attachmentRepository)
    }
}
