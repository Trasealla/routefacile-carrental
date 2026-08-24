import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from 'src/entities/offer.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class OfferService extends BaseService<Offer>{
    constructor(@InjectRepository(Offer) offerRepository: Repository<Offer>) {
        super(offerRepository)
    }
}
