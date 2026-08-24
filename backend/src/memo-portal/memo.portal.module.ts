import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { MemoPortalUser } from 'src/entities/memo.portal.user.entity';
import { MemoPortalOtp } from 'src/entities/memo.portal.otp.entity';

import { MemoPortalUserService } from './memo.portal.user.service';
import { MemoPortalOtpService } from './memo.portal.otp.service';
import { MemoPortalAuthService } from './memo.portal.auth.service';
import { MemoPortalAuthController } from './memo.portal.auth.controller';
import { MemoPortalController } from './memo.portal.controller';

import { MailModule } from 'src/mail/mail.module';
import { MemoModule } from 'src/memo/memo.module';
import { PortalJwtStrategy } from 'src/auth/strategy/portal.jwt.strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret:
          configService.get<string>('PORTAL_JWT_SECRET') ||
          configService.get<string>('ADMIN_JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('PORTAL_JWT_EXPIRY') || '12h' },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([MemoPortalUser, MemoPortalOtp]),
    MailModule,
    MemoModule,
  ],
  controllers: [MemoPortalAuthController, MemoPortalController],
  providers: [
    MemoPortalUserService,
    MemoPortalOtpService,
    MemoPortalAuthService,
    PortalJwtStrategy,
  ],
  exports: [MemoPortalUserService],
})
export class MemoPortalModule {}
