import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EdcPromoConfig } from 'src/entities/edc.promo.config.entity';
import { EdcTerm } from 'src/entities/edc.term.entity';
import { EdcVerification } from 'src/entities/edc.verification.entity';
import { EdcPromoController } from './edc.promo.controller';
import { EdcTermController } from './edc.term.controller';
import { EdcVerificationController } from './edc.verification.controller';
import { EdcPromoService } from './edc.promo.service';
import { EdcTermService } from './edc.term.service';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            EdcPromoConfig,
            EdcTerm,
            EdcVerification
        ])
    ],
    controllers: [
        EdcPromoController,
        EdcTermController,
        EdcVerificationController
    ],
    providers: [
        EdcPromoService,
        EdcTermService
    ],
    exports: [
        EdcPromoService,
        EdcTermService
    ]
})
export class EdcAdminModule {}







