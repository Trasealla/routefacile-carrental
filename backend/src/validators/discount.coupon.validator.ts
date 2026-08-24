import { Inject, Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DiscountCouponService } from 'src/booking/car.search/discount.coupon.service';
import { getCurrentDate } from 'src/admin/utils/date.util';


@Injectable()
@ValidatorConstraint({ name: 'DiscountCouponValid', async: true })
export class DiscountCouponValid implements ValidatorConstraintInterface {

    constructor(
        @Inject(DiscountCouponService) private discountCouponService: DiscountCouponService
    ) { }



    async validate(value: any, args: ValidationArguments): Promise<boolean> {
        const { booking_source } = args.object as any;
        if (value) {
            const discount_coupon = await this.discountCouponService.getOne({ code: value });
            if (discount_coupon) {
                // When applicable_for is null/empty, the coupon applies to all sources.
                if (
                    Array.isArray(discount_coupon.applicable_for) &&
                    discount_coupon.applicable_for.length > 0 &&
                    !discount_coupon.applicable_for.includes(booking_source)
                ) {
                    return false;
                }
            }
        }

        return true;

    }

    defaultMessage(args: ValidationArguments): string {
        return `Invalid Coupon`;
    }
}
