import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChauffeurEnquiry } from 'src/entities/chauffeur.enquiry.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class ChauffeurEnquiryService extends BaseService<ChauffeurEnquiry> {
    constructor(@InjectRepository(ChauffeurEnquiry) private chauffeurEnquiryyRepository: Repository<ChauffeurEnquiry>) {
        super(chauffeurEnquiryyRepository)
    }
}
