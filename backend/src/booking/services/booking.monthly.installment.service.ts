import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BookingMonthlyInstallment } from 'src/entities/booking.monthly.installment.entity';

import { BaseService } from 'src/service/base.service';
import { Repository } from 'typeorm';
import { ConfirmBookingDto } from '../confirm.booking/confirm.booking.dto';
import { calculateReservation } from 'src/admin/utils/date.util';
import { Booking } from 'src/entities/booking.entity';
import { Exception } from 'handlebars';
import { BookingTypes } from 'src/entities/enums/booking.type';
import { PaymentTypes } from 'src/entities/enums/payment.type';
import { MiscChargeService } from '../car.search/misc.charge.service';

@Injectable()
export class BookingMonthlyInstallmentService extends BaseService<BookingMonthlyInstallment> {
    constructor(
        @InjectRepository(BookingMonthlyInstallment) bookingMonthlyInstallment: Repository<BookingMonthlyInstallment>,
        @Inject(MiscChargeService) private miscChargeService: MiscChargeService

    ) {
        super(bookingMonthlyInstallment)
    }

    async prepareInstallments(
        body: ConfirmBookingDto,
        car_rate: any,
        car_extras: any,
        extra_kms_per_month_rate: number,
        parent_booking: Booking
    ) {
        if (body.booking_type == BookingTypes.MONTHLY) {
            const booking_days_res = calculateReservation(body.pickup_date, body.pickup_time, body.dropoff_date, body.dropoff_time);
            const misc_charges = await this.miscChargeService.getMiscChargesAsObject();
            const booking_months = booking_days_res.booking_months;
            const flexi_days = booking_days_res.flexi_days;
            /*
                Ramzan offer till 31 Aug
            */
            const pay_now_discount = (body.payment_type == PaymentTypes.PAY_NOW && body.pickup_date <= '2026-12-31') ? misc_charges.monthly_pay_now_discount : 0;
            //const pay_now_discount = (body.payment_type == PaymentTypes.PAY_NOW) ? misc_charges.monthly_pay_now_discount : 0;
            const installments = [];

            // Tax rate, taken from the configurable misc charge rather than a
            // literal. This was hard-coded to 5/100 — the UAE VAT rate — so every
            // monthly installment was inflated by 5% regardless of the configured
            // rate, which is 0. Reading the setting keeps one source of truth and
            // means the rate can be changed from the admin if that ever changes.
            const vat_percentage = Number(misc_charges.vat || 0) / 100;
            let details;

            // Case for 1 full month and 0 flexi days (single installment scenario)
            if (booking_months === 1 && flexi_days === 0) {
                let firstInstallmentAmount =
                    Number(car_rate.per_month_rate) - pay_now_discount +
                    Number(car_rate.delivery_charges) +
                    Number(car_rate.pickup_parking_charges) +
                    Number(car_extras.per_month_rate) +
                    Number(car_rate.inter_cities_charges) +
                    Number(car_rate.collection_charges) +
                    Number(car_rate.dropoff_parking_charges) +
                    Number(car_rate.per_month_vmd_charges) +
                    Number(extra_kms_per_month_rate);

                details = { cat: 1, 'Car Rate': car_rate.org_per_month_rate, 'Pay Now Discount': pay_now_discount, 'Delivery Charges': car_rate.delivery_charges, 'Pickup Parking Charges': car_rate.pickup_parking_charges, 'Extras Rate': car_extras.per_month_rate, 'Inter Cities Charges': car_rate.inter_cities_charges, 'Car Collection Charges': car_rate.collection_charges, 'Dropoff Parking Charges': car_rate.dropoff_parking_charges, 'Extra KMs': extra_kms_per_month_rate, 'VMD': car_rate.per_month_vmd_charges, 'Promo Coupon Discount': car_rate.monthly_discount_value };

                let previous_first_installment_total_amount, refund_amount = null;
                let amount_message = '';
                let first_installment_total_amount = firstInstallmentAmount + (firstInstallmentAmount * vat_percentage)
                const actual_amount = first_installment_total_amount;
                if (parent_booking) {
                    const installments = parent_booking.monthly_installments
                    const first_installment = installments.find(installment => installment.installment_no == 1);

                    if (parent_booking.payment_type == PaymentTypes.PAY_NOW) {
                        previous_first_installment_total_amount = Number(first_installment.actual_amount);
                        if ((previous_first_installment_total_amount.toFixed(2)) == (first_installment_total_amount).toFixed(2)) {
                            amount_message = `Same amount already paid`;
                            first_installment_total_amount = 0;
                        } else if (previous_first_installment_total_amount > first_installment_total_amount) {
                            refund_amount = previous_first_installment_total_amount - first_installment_total_amount;
                            amount_message = `Refund amount ${refund_amount}`
                            first_installment_total_amount = 0;
                        } else {
                            amount_message = `You need to pay ${(first_installment_total_amount - previous_first_installment_total_amount)}`;
                            first_installment_total_amount = first_installment_total_amount - previous_first_installment_total_amount;
                        }
                    }
                }
                installments.push({
                    installment_no: 1,
                    sub_amount: firstInstallmentAmount.toFixed(2),
                    vat_amount: (firstInstallmentAmount * vat_percentage).toFixed(2),
                    total_amount: first_installment_total_amount,
                    actual_amount: actual_amount,
                    previous_total_amount: previous_first_installment_total_amount,
                    refund_amount: refund_amount,
                    amount_message: amount_message,
                    details
                });
            } else {
                // First installment (includes car extras, delivery, and parking)
                let firstInstallmentAmount =
                    Number(car_rate.per_month_rate) - pay_now_discount +
                    Number(car_rate.delivery_charges) +
                    Number(car_rate.pickup_parking_charges) +
                    Number(car_extras.per_month_rate) +
                    Number(car_rate.per_month_vmd_charges) +
                    Number(extra_kms_per_month_rate);

                details = { cat: 2, 'Car Rate': car_rate.org_per_month_rate, 'Pay Now Discount': pay_now_discount, 'Delivery Charges': car_rate.delivery_charges, 'Pickup Parking Charges': car_rate.pickup_parking_charges, 'Extras Rate': car_extras.per_month_rate, 'Extra KMs': extra_kms_per_month_rate, 'VMD' : car_rate.per_month_vmd_charges, 'Promo Coupon Discount': car_rate.monthly_discount_value }

                let previous_first_installment_total_amount, refund_amount = null;
                let amount_message = '';
                let first_installment_total_amount = firstInstallmentAmount + (firstInstallmentAmount * vat_percentage)
                const actual_amount = first_installment_total_amount;
                if (parent_booking) {
                    const installments = parent_booking.monthly_installments
                    const first_installment = installments.find(installment => installment.installment_no == 1);
                    if (parent_booking.payment_type == PaymentTypes.PAY_NOW) {
                        previous_first_installment_total_amount = Number(first_installment.actual_amount);
                        if (previous_first_installment_total_amount == first_installment_total_amount) {
                            amount_message = `Same amount already paid`;
                            first_installment_total_amount = 0;
                        } else if (previous_first_installment_total_amount > first_installment_total_amount) {

                            refund_amount = previous_first_installment_total_amount - first_installment_total_amount;
                            amount_message = `Refund amount ${refund_amount}`
                            first_installment_total_amount = 0;
                        } else {
                            amount_message = `You need to pay ${(first_installment_total_amount - previous_first_installment_total_amount)}`;
                            first_installment_total_amount = first_installment_total_amount - previous_first_installment_total_amount;
                        }
                    }
                }
                installments.push({
                    installment_no: 1,
                    sub_amount: firstInstallmentAmount.toFixed(2),
                    vat_amount: (firstInstallmentAmount * vat_percentage).toFixed(2),
                    total_amount: first_installment_total_amount,
                    actual_amount: actual_amount,
                    details,
                    previous_total_amount: previous_first_installment_total_amount,
                    refund_amount: refund_amount,
                    amount_message: amount_message,
                });

                const flexi_days_check = (flexi_days > 0) ? 1 : 0; // let the loop run for all remaining months if there are flexi days, otherwise skip last installment to handle delivery, collection charges separately
                // Subsequent installments (monthly)
                for (let i = 2; i < (booking_months + flexi_days_check); i++) {
                    let monthlyInstallmentAmount =
                        Number(car_rate.org_per_month_rate) +
                        Number(car_extras.per_month_rate) +
                        Number(car_rate.per_month_vmd_charges) +
                        Number(extra_kms_per_month_rate);

                    details = { cat: 3, 'Car Rate': car_rate.org_per_month_rate, 'Extras Rate': car_extras.per_month_rate, 'Extra KMs': extra_kms_per_month_rate, 'VMD': car_rate.per_month_vmd_charges }

                    installments.push({
                        installment_no: i,
                        sub_amount: monthlyInstallmentAmount.toFixed(2),
                        vat_amount: (monthlyInstallmentAmount * vat_percentage).toFixed(2),
                        total_amount: (monthlyInstallmentAmount + (monthlyInstallmentAmount * vat_percentage)).toFixed(2),
                        actual_amount: (monthlyInstallmentAmount + (monthlyInstallmentAmount * vat_percentage)).toFixed(2),
                        details
                    });
                }

                // Last installment for flexi days
                if (flexi_days > 0) {
                    let lastInstallmentAmount =
                        car_rate.flexi_days_rate +
                        Number(car_rate.inter_cities_charges) +
                        Number(car_rate.collection_charges) +
                        Number(car_rate.dropoff_parking_charges) +
                        Number(car_extras.flexi_days_rate) +
                        Number(car_rate.flexi_days_vmd_charges) +
                        (Number(extra_kms_per_month_rate) / 30) * flexi_days;

                    details = { cat: 4, 'Car Rate (for Flexi Days)': car_rate.org_flexi_days_rate, 'Inter Cities Charges': car_rate.inter_cities_charges, 'Car Collection Charges': car_rate.collection_charges, 'Dropoff Parking Charges': car_rate.dropoff_parking_charges, 'Extras Rate': car_extras.flexi_days_rate, 'Extra KMs': (Number(extra_kms_per_month_rate) / 30 * flexi_days).toFixed(2), 'VMD': car_rate.flexi_days_vmd_charges }

                    installments.push({
                        installment_no: booking_months + 1,
                        sub_amount: lastInstallmentAmount.toFixed(2),
                        vat_amount: (lastInstallmentAmount * vat_percentage).toFixed(2),
                        total_amount: (lastInstallmentAmount + (lastInstallmentAmount * vat_percentage)).toFixed(2),
                        actual_amount: (lastInstallmentAmount + (lastInstallmentAmount * vat_percentage)).toFixed(2),
                        details
                    });
                } else { // Last installment for last month
                    let lastInstallmentAmount =
                        Number(car_rate.org_per_month_rate) +
                        Number(car_rate.inter_cities_charges) +
                        Number(car_rate.collection_charges) +
                        Number(car_rate.dropoff_parking_charges) +
                        Number(car_extras.per_month_rate) +
                        Number(car_rate.per_month_vmd_charges) +
                        Number(extra_kms_per_month_rate);

                    details = { cat: 5, 'Car Rate': Number(car_rate.org_per_month_rate), 'Inter Cities Charges': car_rate.inter_cities_charges, 'Car Collection Charges': car_rate.collection_charges, 'Dropoff Parking Charges': car_rate.dropoff_parking_charges, 'Extras Rate': car_extras.per_month_rate, 'Extra KMs': Number(extra_kms_per_month_rate), 'VMD': car_rate.per_month_vmd_charges };

                    installments.push({
                        installment_no: booking_months,
                        sub_amount: lastInstallmentAmount.toFixed(2),
                        vat_amount: (lastInstallmentAmount * vat_percentage).toFixed(2),
                        total_amount: (lastInstallmentAmount + (lastInstallmentAmount * vat_percentage)).toFixed(2),
                        actual_amount: (lastInstallmentAmount + (lastInstallmentAmount * vat_percentage)).toFixed(2),
                        details
                    });
                }
            }

            return installments;
        }
    }




    async saveInstallments(installments, booking_id: number, booking_date: Date) {
        try {

            let date = new Date(booking_date);

            for (let i = 0; i < installments.length; i++) {
                // For the first installment, the due date is the booking date
                if (i > 0) {
                    // Increment the month by one for each subsequent installment
                    date.setMonth(date.getMonth() + 1);
                }

                // Ensure safe handling of date increments for months with different lengths
                let dueDate = new Date(date);

                // Save the installment to the database
                const r = await this.insert({
                    installment_no: installments[i].installment_no,
                    booking_id: booking_id,
                    due_date: dueDate,
                    sub_amount: installments[i].sub_amount,
                    vat_percentage: 5, // Assuming VAT is always 5%
                    vat_amount: installments[i].vat_amount, // Assuming VAT is always 5%
                    total_amount: installments[i].total_amount,
                    actual_amount: installments[i].actual_amount,
                    details: installments[i].details,
                    previous_total_amount: installments[i].previous_total_amount,
                    refund_amount: installments[i].refund_amount,
                    amount_message: installments[i].amount_message
                });
            }
        } catch (error) {
            throw new Exception(error)
        }

    }
}
