import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoAuditActorScope, MemoAuditLog } from 'src/entities/memo.audit.log.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoAuditLogService extends BaseService<MemoAuditLog> {
  constructor(@InjectRepository(MemoAuditLog) public readonly repo: Repository<MemoAuditLog>) {
    super(repo);
  }

  async record(
    actor_id: number,
    action: string,
    entity_type: string,
    entity_id: number,
    metadata?: any,
    ip?: string,
    actor_scope: MemoAuditActorScope = MemoAuditActorScope.ADMIN,
  ) {
    try {
      await this.repo.insert({
        actor_id,
        actor_scope,
        action,
        entity_type,
        entity_id,
        metadata_json: metadata ? JSON.stringify(metadata) : null,
        ip,
      } as any);
    } catch (e) {
      // never fail the request because of audit logging
      console.error('MemoAuditLog insert error:', e?.message);
    }
  }
}
