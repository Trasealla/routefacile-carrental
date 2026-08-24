import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BookingService extends BaseService<Booking> {
    constructor(
        @InjectRepository(Booking) repo: Repository<Booking>
    ) {
        super(repo)
    }
}
