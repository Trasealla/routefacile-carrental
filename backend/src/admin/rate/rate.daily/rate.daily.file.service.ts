import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateDailyFile } from 'src/entities/rate.daily.file.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateDailyFileService extends BaseService<RateDailyFile> {

    constructor(
        @InjectRepository(RateDailyFile) RateDailyFileRepo: Repository<RateDailyFile>
    ) {
        super(RateDailyFileRepo);
    }
}
