import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Broker } from 'src/entities/broker.entity';
import { BrokerController } from './broker.controller';
import { BrokerService } from './broker.service';

@Module({
  imports: [TypeOrmModule.forFeature([Broker])],
  controllers: [BrokerController],
  providers: [BrokerService],
  exports: [BrokerService]
})
export class BrokerModule {}
