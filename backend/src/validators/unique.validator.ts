import { Injectable } from '@nestjs/common';
import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
import { DataSource, EntityTarget, Repository } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
@ValidatorConstraint({ name: 'isUnique', async: true }) // Make sure to apply the ValidatorConstraint decorator
export class IsUnique implements ValidatorConstraintInterface {

    constructor(
        @InjectDataSource() private readonly dataSource: DataSource
    ) { }

    async getRepository<T>(entity: EntityTarget<T>): Promise<Repository<T>> {
        return this.dataSource.getRepository(entity);
    }

    async validate(value: any, args: ValidationArguments): Promise<boolean> {
        const [EntityClass, column] = args.constraints as [Function, string];

        const repository = await this.getRepository(EntityClass);
        const userId = (args.object as any).id;

        // Find an entity by the specified column and value
        const existingEntity = await repository.findOne({ where: { [column]: value } });

        // If no existing entity is found, value is unique
        return !existingEntity;
    }

    defaultMessage(validationArguments: ValidationArguments): string {
        const field = validationArguments.property;
        return `${field} already exists.`;
    }
}
