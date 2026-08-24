import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Surge } from 'src/entities/surge.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class SurgeService extends BaseService<Surge> {
    constructor(
        @InjectRepository(Surge) repo: Repository<Surge>
    ) {
        super(repo)
    }
}
