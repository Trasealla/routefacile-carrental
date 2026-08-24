import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoDocumentAccess } from 'src/entities/memo.document.access.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoDocumentAccessService extends BaseService<MemoDocumentAccess> {
  constructor(@InjectRepository(MemoDocumentAccess) public readonly repo: Repository<MemoDocumentAccess>) {
    super(repo);
  }
}
