import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlogTag } from 'src/entities/blog.tag.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BlogTagService extends BaseService<BlogTag> {
    constructor(
        @InjectRepository(BlogTag) repo: Repository<BlogTag>
    ) {
        super(repo)
    }
}
