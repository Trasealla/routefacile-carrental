import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OfferEnquiry } from 'src/entities/offer.enquiry.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class OfferEnquiryService extends BaseService<OfferEnquiry>{
    constructor(@InjectRepository(OfferEnquiry) private offerEnquiryRepository: Repository<OfferEnquiry>) {
        super(offerEnquiryRepository)
    }
}
