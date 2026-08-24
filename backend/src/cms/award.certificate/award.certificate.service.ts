import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AwardCertificate } from 'src/entities/award.certificate.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class AwardCertificateService extends BaseService<AwardCertificate>{
    constructor(
        @InjectRepository(AwardCertificate) private awardCertificateRepository: Repository<AwardCertificate>,
    ) {
        super(awardCertificateRepository);
    }
}
