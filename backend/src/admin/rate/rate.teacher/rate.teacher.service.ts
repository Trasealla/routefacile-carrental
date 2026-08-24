import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RateTeacher } from 'src/entities/rate.teacher.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RateTeacherService extends BaseService<RateTeacher> {
    constructor(
        @InjectRepository(RateTeacher) RateTeacherRepo: Repository<RateTeacher>
    ) {
        super(RateTeacherRepo)
    }
}
