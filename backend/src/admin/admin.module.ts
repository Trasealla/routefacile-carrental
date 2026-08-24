import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RateModule } from './rate/rate.module';
import { UserModule } from './user/user.module';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Admin } from 'src/entities/admin.entity';
import { CarModule } from './car/car.module';
import { CacheBustingService } from './cache.busting.service';
import { City } from 'src/entities/city.entity';
import { CacheService } from 'src/cache/cache.service';
import { CityService } from 'src/city/city.service';
import { CmsModule } from './cms/cms.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { CarService } from './car/car.service';
import { BookingRepoService } from 'src/booking/services/booking.repo.service';
import { Car } from 'src/entities/car.entity';
import { Booking } from 'src/entities/booking.entity';
import { BookingModule } from './booking/booking.module';
import { MailModule } from './mail/mail.module';
import { RefundModule } from './refund/refund.module';
import { EdcAdminModule } from './edc/edc.module';
import { RecruitingModule } from './recruiting/recruiting.module';
import { AdminKycModule } from './kyc/kyc.module';
import { AdminMemoModule } from './memo/admin.memo.module';

@Module({
  imports: [TypeOrmModule.forFeature([Admin, City, Car, Booking]), RateModule, UserModule, CarModule, CmsModule, BookingModule, MailModule, RefundModule, EdcAdminModule, RecruitingModule, AdminKycModule, AdminMemoModule],
  controllers: [AdminController, DashboardController],
  providers: [AdminService, CacheBustingService, CacheService, CityService, CarService, BookingRepoService]
})
export class AdminModule { }
