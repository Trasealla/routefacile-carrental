import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateRangeFile } from 'src/entities/rate.range.file.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateRangeFileService extends BaseService<RateRangeFile> {

    constructor(
        @InjectRepository(RateRangeFile) rateRangeFile: Repository<RateRangeFile>
    ) {
        super(rateRangeFile)
    }
}
