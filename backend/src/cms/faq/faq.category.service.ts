import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FaqCategory } from 'src/entities/faq.category.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class FaqCategoryService extends BaseService<FaqCategory> {

    constructor(
        @InjectRepository(FaqCategory) private faqCategoryRepository: Repository<FaqCategory>
    ) {
        super(faqCategoryRepository)
    }
}
