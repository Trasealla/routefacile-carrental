import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppSetting } from 'src/entities/app.setting.entity';
import { SettingsService } from './settings.service';
import { SettingsPublicController } from './settings.controller';
import { AdminSettingsController } from './admin.settings.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AppSetting])],
  controllers: [SettingsPublicController, AdminSettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule { }
