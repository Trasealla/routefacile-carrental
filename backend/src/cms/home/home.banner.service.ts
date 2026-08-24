import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HomeBanner } from 'src/entities/home.banner.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class HomeBannerService extends BaseService<HomeBanner> {
    constructor(
        @InjectRepository(HomeBanner) private homeBannerRepository: Repository<HomeBanner>,
    ) {
        super(homeBannerRepository);
    }
}
