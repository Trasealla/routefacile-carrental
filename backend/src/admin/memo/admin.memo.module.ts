import { Module } from '@nestjs/common';
import { MemoModule } from 'src/memo/memo.module';
import { AdminMemoCategoryController } from './memo.category.controller';
import { AdminMemoDocumentController } from './memo.document.controller';
import { AdminMemoDashboardController, AdminMemoUserLookupController } from './memo.misc.controller';

@Module({
  imports: [MemoModule],
  controllers: [
    AdminMemoCategoryController,
    AdminMemoDocumentController,
    AdminMemoDashboardController,
    AdminMemoUserLookupController,
  ],
})
export class AdminMemoModule { }
