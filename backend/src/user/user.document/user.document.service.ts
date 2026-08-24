import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserDocument } from 'src/entities/user.document.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class UserDocumentService extends BaseService<UserDocument> {

    constructor(
        @InjectRepository(UserDocument) userDocumentRepository: Repository<UserDocument>
    ) {
        super(userDocumentRepository)
    }
}
