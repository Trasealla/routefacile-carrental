import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/cache/cache.service';
import { MiscCharge } from 'src/entities/misc.charge.entity';
import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';

@Injectable()
export class MiscChargeService extends BaseService<MiscCharge> {

    private CACHE_KEY = 'misc_charge'
    constructor(
        @InjectRepository(MiscCharge) repo: Repository<MiscCharge>,
        @Inject(CacheService) private cacheService: CacheService
    ) {
        super(repo)
    }

    async getMiscChargesAsObject(): Promise<any> {

        const response = await this.cacheService.get(this.CACHE_KEY);
        if (response) {
            return response;
        }

        const charges = await this.repository.find();
        const chargesObject: { [key: string]: number } = {};

        charges.forEach(charge => {
            chargesObject[charge.key] = charge.rate;
        });

        await this.cacheService.set(this.CACHE_KEY, chargesObject)

        return chargesObject;
    }
}
