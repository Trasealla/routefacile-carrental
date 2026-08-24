import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingPaymentTransaction } from 'src/entities/booking.payment.transaction.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class BookingPaymentTransactionService extends BaseService<BookingPaymentTransaction> {
    constructor(
        @InjectRepository(BookingPaymentTransaction) repo: Repository<BookingPaymentTransaction>
    ) {
        super(repo)
    }

    static TOKENIZATION = 'TOKENIZATION'
    static TOKENIZATION_CALLBACK = 'TOKENIZATION_CALLBACK'
    static PURCHASE = 'PURCHASE'
    static PURCHASE_RESPONSE = 'PURCHASE_RESPONSE'
    static FINALIZATION = 'FINALIZATION'
    static FEEDBACK_FINALIZATION = 'FEEDBACK_FINALIZATION'
}
