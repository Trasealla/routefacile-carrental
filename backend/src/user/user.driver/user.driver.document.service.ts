import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDriverDocument } from 'src/entities/user.driver.document.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserDriverDocumentService extends BaseService<UserDriverDocument> {

    constructor(
        @InjectRepository(UserDriverDocument) userDriverDocumentRepo: Repository<UserDriverDocument>
    ) {
        super(userDriverDocumentRepo)
    }
}