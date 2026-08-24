import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Faq } from 'src/entities/faq.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class FaqService extends BaseService<Faq> {

    constructor(
        @InjectRepository(Faq) private faqRepository: Repository<Faq>
    ) {
        super(faqRepository)
    }
}
