import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MemoCategory } from 'src/entities/memo.category.entity';
import { MemoDocument } from 'src/entities/memo.document.entity';
import { MemoDocumentVersion } from 'src/entities/memo.document.version.entity';
import { MemoDocumentAccess } from 'src/entities/memo.document.access.entity';
import { MemoDocumentView } from 'src/entities/memo.document.view.entity';
import { MemoAuditLog } from 'src/entities/memo.audit.log.entity';
import { Admin as AdminEntity } from 'src/entities/admin.entity';

import { MemoCategoryService } from './memo.category.service';
import { MemoDocumentService } from './memo.document.service';
import { MemoDocumentVersionService } from './memo.document.version.service';
import { MemoDocumentAccessService } from './memo.document.access.service';
import { MemoDocumentViewService } from './memo.document.view.service';
import { MemoAuditLogService } from './memo.audit.log.service';
import { MemoAccessResolverService } from './memo.access.resolver.service';
import { MemoEndUserController } from './memo.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MemoCategory,
      MemoDocument,
      MemoDocumentVersion,
      MemoDocumentAccess,
      MemoDocumentView,
      MemoAuditLog,
      AdminEntity,
    ]),
  ],
  controllers: [MemoEndUserController],
  providers: [
    MemoCategoryService,
    MemoDocumentService,
    MemoDocumentVersionService,
    MemoDocumentAccessService,
    MemoDocumentViewService,
    MemoAuditLogService,
    MemoAccessResolverService,
  ],
  exports: [
    MemoCategoryService,
    MemoDocumentService,
    MemoDocumentVersionService,
    MemoDocumentAccessService,
    MemoDocumentViewService,
    MemoAuditLogService,
    MemoAccessResolverService,
    TypeOrmModule,
  ],
})
export class MemoModule { }
