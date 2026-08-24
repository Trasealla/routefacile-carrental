import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MailResponse } from 'src/entities/mail.response.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class MailService extends BaseService<MailResponse> {

    constructor(@InjectRepository(MailResponse) repo: Repository<MailResponse>) {
        super(repo)
    }
}
