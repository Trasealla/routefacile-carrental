import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RecruitingDepartment } from 'src/entities/recruiting.department.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class RecruitingDepartmentService extends BaseService<RecruitingDepartment> {
    constructor(@InjectRepository(RecruitingDepartment) private departmentRepository: Repository<RecruitingDepartment>) {
        super(departmentRepository)
    }
}
