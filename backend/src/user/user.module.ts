import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { UserForgotPasswordService } from './user.forgot.password.service';
import { UserForgotPassword } from 'src/entities/user.forgot.password.entity';
import { AuthService } from 'src/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserProfileController } from './user.profile/user.profile.controller';
import { UserActiveController } from './user.active.controller';
import { UserDocumentController } from './user.document/user.document.controller';
import { UserDocumentService } from './user.document/user.document.service';
import { UserDocument } from 'src/entities/user.document.entity';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/entities/admin.entity';
import { UserDriverController } from './user.driver/user.driver.controller';
import { UserDriverService } from './user.driver/user.driver.service';
import { UserDriverDocumentService } from './user.driver/user.driver.document.service';
import { UserDriver } from 'src/entities/user.driver.entity';
import { UserDriverDocument } from 'src/entities/user.driver.document.entity';
import { UserDocumentTypeController } from './user.document/user.document.type.controller';
import { UserBookingController } from './user.booking/user.booking.controller';
import { UserBookingService } from './user.booking/user.booking.service';
import { Booking } from 'src/entities/booking.entity';
import { UserDeleteController } from './user.delete.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserForgotPassword, UserDocument, Admin, UserDriver, UserDriverDocument, Booking])],
  providers: [
    UserService,
    UserForgotPasswordService,
    AuthService,
    JwtService,
    ConfigService,
    UserDocumentService,
    AdminService,
    UserDriverService,
    UserDriverDocumentService,
    UserBookingService
  ],
  controllers: [UserController, UserProfileController, UserActiveController, UserDocumentController, UserDriverController, UserDocumentTypeController, UserBookingController, UserDeleteController]
})
export class UserModule { }
