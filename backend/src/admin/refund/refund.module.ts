import { Module } from '@nestjs/common';
import { RefundController } from './refund.controller';
import { BookingService } from '../booking/booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Booking } from 'src/entities/booking.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [RefundController],
  providers: [BookingService]
})
export class RefundModule { }