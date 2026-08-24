import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'Match', async: true }) // Make sure to apply the ValidatorConstraint decorator
export class Match implements ValidatorConstraintInterface {

    async validate(value: any, args: ValidationArguments): Promise<boolean> {

        const [original_field_key] = args.constraints; // password
        const original_field_value = args.object[original_field_key]; // password value

        return value === original_field_value; // confirm_password === password

    }

    defaultMessage(args: ValidationArguments): string {
        const [original_field_key] = args.constraints; // password
        const field = args.property;
        return `${field} does not match with ${original_field_key}`;
    }
}
