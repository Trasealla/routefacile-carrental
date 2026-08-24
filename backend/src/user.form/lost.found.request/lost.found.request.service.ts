import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LostFoundRequest } from 'src/entities/lost.found.request.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class LostFoundRequestService extends BaseService<LostFoundRequest> {
    constructor(
        @InjectRepository(LostFoundRequest) private lostFoundRequestRepository: Repository<LostFoundRequest>
    ){
        super(lostFoundRequestRepository)
    }
}
