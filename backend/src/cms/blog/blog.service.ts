import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BlogService extends BaseService<Blog> {
    constructor(
        @InjectRepository(Blog) blogReposotory: Repository<Blog>
    ) {
        super(blogReposotory);
    }
}
