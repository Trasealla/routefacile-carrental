import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TeachersPage } from 'src/entities/teachers.page.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class TeachersPageService extends BaseService<TeachersPage> {
  constructor(
    @InjectRepository(TeachersPage) repo: Repository<TeachersPage>,
  ) {
    super(repo);
  }
}
