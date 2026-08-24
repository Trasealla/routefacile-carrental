import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogCategory } from 'src/entities/blog.category.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BlogCategoryService extends BaseService<BlogCategory> {
    constructor(
        @InjectRepository(BlogCategory) repo: Repository<BlogCategory>
    ) {
        super(repo)
    }
}
