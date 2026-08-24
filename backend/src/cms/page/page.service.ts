import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Page } from 'src/entities/page.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class PageService extends BaseService<Page> {
    constructor(
        @InjectRepository(Page) repo: Repository<Page>
    ) {
        super(repo)
    }
}
