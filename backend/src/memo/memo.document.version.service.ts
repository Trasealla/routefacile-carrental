import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoDocumentVersion } from 'src/entities/memo.document.version.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoDocumentVersionService extends BaseService<MemoDocumentVersion> {
  constructor(@InjectRepository(MemoDocumentVersion) public readonly repo: Repository<MemoDocumentVersion>) {
    super(repo);
  }
}
