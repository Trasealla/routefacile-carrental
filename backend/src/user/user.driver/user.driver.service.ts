import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDriver } from 'src/entities/user.driver.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserDriverService extends BaseService<UserDriver> {

    constructor(
        @InjectRepository(UserDriver) userDriverRepo: Repository<UserDriver>
    ) {
        super(userDriverRepo)
    }
}
