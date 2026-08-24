import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module'
import { User } from './entities/user.entity';
import { AdminModule } from './admin/admin.module';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config();

import { MailModule } from './mail/mail.module';
import { LocationModule } from './location/location.module';
import { CityModule } from './city/city.module';
import { BookingModule } from './booking/booking.module'; 
import { CacheModule } from '@nestjs/cache-manager';
import { CacheController } from './cache/cache.controller';
import { CmsModule } from './cms/cms.module';
import { AppConfig } from './config/app.config';
import { UserModule } from './user/user.module';
import * as redisStore from 'cache-manager-redis-store';
import { CacheService } from './cache/cache.service';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EventModule } from './event/event.module';
import { CarModule } from './car/car.module';
import { UserFormModule } from './user.form/user.form.module';
import { MobileAppVersionController } from './mobile.app.version.controller';
import { TsdModule } from './tsd/tsd.module';
import { MemoModule } from './memo/memo.module';
import { MemoPortalModule } from './memo-portal/memo.portal.module';
import { BrokerModule } from './admin/broker/broker.module';
import { BrokerApiModule } from './broker/broker.module';
import { AdminBookingCreateModule } from './admin/booking.create/admin.booking.create.module';
import { SettingsModule } from './settings/settings.module';


import { ArticleWebhookModule } from './cms/article-webhook/article-webhook.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AdminModule,
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      retryAttempts: 1, // Number of retry attempts before giving up
      retryDelay: 1, // Time in milliseconds between retry attempts
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      "extra": {
        "charset": "utf8mb4_unicode_ci"
      },
      entities: ["dist/**/*.entity{.ts,.js}"],
      // SAFETY: schema sync is OPT-IN only via DB_SYNCHRONIZE=true.
      // Never default to true on staging/production — auto-sync has caused
      // recurring boot failures (e.g. trying to drop indexes still bound by FKs).
      // Use proper SQL migrations on shared environments.
      synchronize: process.env.DB_SYNCHRONIZE === 'true'
    }),
    TypeOrmModule.forFeature([User]),
    RouterModule.register([
      {
        path: "admin",
        module: AdminModule,
      },
    ]),
    MailModule,
    LocationModule,
    CityModule,
    BookingModule,
    CmsModule,
    ArticleWebhookModule,
    UserModule,
    ThrottlerModule.forRoot([{
      ttl: 6000,
      limit: 100,
    }]),
    EventModule,
    CarModule,
    UserFormModule,
    TsdModule,
    MemoModule,
    MemoPortalModule,
    BrokerModule,
    BrokerApiModule,
    AdminBookingCreateModule,
    SettingsModule
  ],
  controllers: [AppController, CacheController, MobileAppVersionController],
  providers: [AppService, AppConfig, CacheService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
