import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoCategory } from 'src/entities/memo.category.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoCategoryService extends BaseService<MemoCategory> {
  constructor(@InjectRepository(MemoCategory) repo: Repository<MemoCategory>) {
    super(repo);
  }
}
