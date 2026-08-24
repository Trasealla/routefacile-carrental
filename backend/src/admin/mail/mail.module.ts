import { Module } from '@nestjs/common';
import { MailController } from './mail.controller';
import { MailService } from './mail.service';
import { MailResponse } from 'src/entities/mail.response.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [MailController],
  imports: [TypeOrmModule.forFeature([MailResponse])],
  providers: [MailService]
})
export class MailModule { }
