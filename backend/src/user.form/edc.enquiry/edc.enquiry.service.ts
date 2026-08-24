import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EdcEnquiry } from 'src/entities/edc.enquiry.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class EdcEnquiryService extends BaseService<EdcEnquiry> {
    constructor(@InjectRepository(EdcEnquiry) private edcEnquiryRepository: Repository<EdcEnquiry>) {
        super(edcEnquiryRepository)
    }
}







