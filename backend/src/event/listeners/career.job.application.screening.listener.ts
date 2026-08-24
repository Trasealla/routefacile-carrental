import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CvScreeningService } from 'src/admin/recruiting/screening/cv.screening.service';
import { CareerJobApplicationEvent } from '../events/career.job.application.event';

@Injectable()
export class CareerJobApplicationScreeningListener {
    private readonly logger = new Logger(CareerJobApplicationScreeningListener.name);

    constructor(private readonly cvScreeningService: CvScreeningService) { }

    @OnEvent('career.job.application')
    async handle(event: CareerJobApplicationEvent) {
        try {
            const result = await this.cvScreeningService.screen(event.application_id);
            this.logger.log(
                `CV screening for application ${event.application_id}: status=${result.status}, score=${result.score}, must_have_matched=${result.matched_must_have.length}, missing=${result.missing_must_have.length}, excludes_hit=${result.matched_exclude.length}`,
            );
        } catch (err) {
            this.logger.error(`CV screening failed for application ${event.application_id}: ${err?.message || err}`);
        }
    }
}
