import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { EDC_PROMO_CONFIG } from 'src/user.form/edc.verification/edc.verification.service';
import { DiscountCoupon } from 'src/entities/discount.coupon.entity';

@Injectable()
@ValidatorConstraint({ name: 'isExists', async: true }) // Make sure to apply the ValidatorConstraint decorator
export class IsExists implements ValidatorConstraintInterface {

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource
    ) { }

    async getRepository<T>(entity: EntityTarget<T>): Promise<Repository<T>> {
        return this.dataSource.getRepository(entity);
    }

    async validate(value: any, args: ValidationArguments): Promise<boolean> {
        const [EntityClass, column] = args.constraints as [Function, string];

        // Special handling for EDC promo code when validating DiscountCoupon
        if (EntityClass === DiscountCoupon && column === 'code') {
            if (value?.toUpperCase() === EDC_PROMO_CONFIG.code.toUpperCase()) {
                return true; // EDC promo code is always valid
            }
        }

        const repository = await this.getRepository(EntityClass);

        // Find an entity by the specified column and value
        const existingEntity = await repository.findOne({ where: { [column]: value } });

        // If no existing entity is found, value is unique
        return existingEntity ? true : false;
    }

    defaultMessage(args: ValidationArguments): string {
        const field = args.property;
        return `${field} does not exist`;
    }
}
