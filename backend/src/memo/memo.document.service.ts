import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoDocument } from 'src/entities/memo.document.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoDocumentService extends BaseService<MemoDocument> {
  constructor(@InjectRepository(MemoDocument) public readonly repo: Repository<MemoDocument>) {
    super(repo);
  }
}
