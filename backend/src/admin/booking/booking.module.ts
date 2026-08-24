import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { Booking } from 'src/entities/booking.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingReportController } from './booking.report.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Booking])],
  controllers: [BookingController, BookingReportController],
  providers: [BookingService]
})
export class BookingModule {

}
