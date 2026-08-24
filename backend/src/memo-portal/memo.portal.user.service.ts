import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MemoPortalUser } from 'src/entities/memo.portal.user.entity';
import { BaseService } from 'src/service/base.service';

@Injectable()
export class MemoPortalUserService extends BaseService<MemoPortalUser> {
  constructor(@InjectRepository(MemoPortalUser) public readonly repo: Repository<MemoPortalUser>) {
    super(repo);
  }

  async findByEmail(email: string): Promise<MemoPortalUser | null> {
    return this.repo.findOne({ where: { email: email.toLowerCase() } as any });
  }

  /**
   * Upsert a portal user on successful PIN verification. Updates last_login_at,
   * sets first_login_at on first login.
   */
  async upsertOnLogin(email: string): Promise<MemoPortalUser> {
    const lower = email.toLowerCase();
    let user = await this.findByEmail(lower);
    const now = new Date();
    if (!user) {
      const inserted = await this.repo.insert({
        email: lower,
        first_login_at: now,
        last_login_at: now,
        status: 1,
      } as any);
      const id = inserted.identifiers?.[0]?.id;
      user = await this.repo.findOne({ where: { id } as any });
    } else {
      await this.repo.update({ id: user.id }, { last_login_at: now } as any);
      user.last_login_at = now;
    }
    return user;
  }
}
