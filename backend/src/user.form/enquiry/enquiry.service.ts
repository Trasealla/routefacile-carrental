import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enquiry } from 'src/entities/enquiry.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class EnquiryService extends BaseService<Enquiry>{
    constructor(@InjectRepository(Enquiry) private enquiryRepository: Repository<Enquiry>) {
        super(enquiryRepository);
    }
}
