import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { ApiKeyStrategy } from './strategy/apikey.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { LocalStrategy } from './strategy/local.strategy';
import { AuthController } from './auth.controller';
import { UserService } from 'src/user/user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { IsUnique } from 'src/validators/unique.validator';
import { Match } from 'src/validators/match.validator';
import { AdminService } from 'src/admin/admin.service';
import { Admin } from 'src/entities/admin.entity';
import { AdminStrategy } from './strategy/admin.strategy';
import { AdminJwtStrategy } from './strategy/admin.jwt.strategy';
import { PortalJwtStrategy } from './strategy/portal.jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: configService.get<string>('JWT_EXPIRY') },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([User, Admin])
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    ApiKeyStrategy,
    JwtStrategy,
    AdminStrategy,
    AdminJwtStrategy,
    PortalJwtStrategy,
    IsUnique,
    Match,
    AdminService
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule { }
