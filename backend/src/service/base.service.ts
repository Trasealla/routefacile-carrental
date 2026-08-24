import { FindOperator, Repository } from 'typeorm';

export abstract class BaseService<T> {

    static ACTIVE = 1;
    static INACTIVE = 0;

    static FEATURED = 1;
    static NOT_FEATURED = 0;

    static SUCCESS = 'success';

    static LEFT_JOIN = 'left';
    static INNER_JOIN = 'inner';

    protected constructor(
        protected readonly repository: Repository<T>,
    ) { }

    async getOne(
        where?: object,
        select?: string[],
        relations?: { [key: string]: { columns: string[], where?: object } },
        join?: string,
        sort?: { column: string, order }
    ): Promise<T> {
        const query = this.repository.createQueryBuilder('entity');

        if (select && select.length > 0) {
            query.select(select.map(column => `entity.${column}`));
        }

        if (where) {
            Object.keys(where).forEach((key, index) => {
                const value = where[key];
                if (value instanceof FindOperator) {
                    if (value.type == 'moreThan') {
                        query.andWhere(`entity.${key} > :value${index}`, { [`value${index}`]: value.value });
                    }  else if (value.type == 'moreThanOrEqual') {
                        query.andWhere(`entity.${key} >= :value${index}`, { [`value${index}`]: value.value });
                    } else if (value.type == 'isNull') {
                        query.andWhere(`entity.${key} is NULL`);
                    }
                } else {
                    query.andWhere(`entity.${key} = :value${index}`, { [`value${index}`]: where[key] });
                }
            });
        }


        if (relations) {
            Object.keys(relations).forEach((relation, relIndex) => {
                const { columns, where: relation_where } = relations[relation];
                const alias = `${relation}_alias`;
                if (join == BaseService.LEFT_JOIN) {
                    query.leftJoin(`entity.${relation}`, alias);
                } else {
                    query.innerJoin(`entity.${relation}`, alias);
                }


                if (columns && columns.length > 0) {
                    columns.forEach(column => {
                        query.addSelect(`${alias}.${column}`);
                    });
                }
                if (relation_where) {
                    Object.keys(relation_where).forEach((key, whereIndex) => {
                        query.andWhere(`${alias}.${key} = :relValue${relIndex}_${whereIndex}`, { [`relValue${relIndex}_${whereIndex}`]: relation_where[key] });
                    });
                }
            });
        }
        if (sort) {
            query.orderBy(sort.column, sort.order)
        }
        // const sqlQuery = query.getSql();
        // console.log('Generated SQL:', sqlQuery);
        // console.log('Where:', where);
        // console.log('Select:', select);
        // console.log('Relations:', relations);
        const entity = await query.getOne();


        return entity;
    }

    async getAll(
        where?: object,
        select?: string[],
        relations?: { [key: string]: { columns: string[], where?: object } },
        join?: string,
        pagination: boolean = false,
        page: number = 1,
        page_size: number = 10,
        sort?: { column: string, order }
    ) {
        const query = this.repository.createQueryBuilder('entity');

        if (select && select.length > 0) {
            query.select(select.map(column => `entity.${column}`));
        }

        if (where) {
            Object.keys(where).forEach((key, index) => {
                const value = where[key];
                if (value instanceof FindOperator) {
                    if (value.type == 'not') {
                        query.andWhere(`entity.${key} != :value${index}`, { [`value${index}`]: value.value });
                    } else if (value.type == 'in') {
                        query.andWhere(`entity.${key} IN (${value.value.join(',')})`);
                    } else if (value.type == 'lessThanOrEqual') {
                        query.andWhere(`entity.${key} <= :value${index}`, { [`value${index}`]: value.value });
                    } else if (value.type == 'moreThanOrEqual') {
                        query.andWhere(`entity.${key} >= :value${index}`, { [`value${index}`]: value.value });
                    } else if (value.type == 'isNull') {
                        query.andWhere(`entity.${key} is NULL`);
                    } else if (value.type == 'moreThan') {
                        query.andWhere(`entity.${key} > :value${index}`, { [`value${index}`]: value.value });
                    } else if (value.type == 'lessThan') {
                        query.andWhere(`entity.${key} < :value${index}`, { [`value${index}`]: value.value });
                    } 
                } else {
                    query.andWhere(`entity.${key} = :value${index}`, { [`value${index}`]: value });
                }
            });
        }

        if (relations) {
            Object.keys(relations).forEach((relation, relIndex) => {
                const { columns, where: relation_where } = relations[relation];
                const alias = `${relation}_alias`;
                if (join == BaseService.LEFT_JOIN) {
                    query.leftJoin(`entity.${relation}`, alias);
                } else {
                    query.innerJoin(`entity.${relation}`, alias);
                }

                if (columns && columns.length > 0) {
                    columns.forEach(column => {
                        query.addSelect(`${alias}.${column}`);
                    });
                }

                if (relation_where) {
                    Object.keys(relation_where).forEach((key, whereIndex) => {
                        query.andWhere(`${alias}.${key} = :relValue${relIndex}_${whereIndex}`, { [`relValue${relIndex}_${whereIndex}`]: relation_where[key] });
                    });
                }
            });
        }

        const count_query = query.clone()

        const total_records = await count_query.getCount();

        if (sort) {
            query.orderBy(sort.column, sort.order)
        }

        if (pagination) {
            query.skip((page - 1) * page_size).take(page_size);
        }

        // const sqlQuery = query.getSql();
        // console.log('Generated SQL:', sqlQuery);
        // console.log('Where conditions:', where);
        // console.log('Select:', select);

        const entites = await query.getMany()

        return {
            data: entites,
            total_records
        };
    }

    async insert(object): Promise<any> {
        try {
            const response = await this.repository.insert(object);
            return { status: 'success', response };
        } catch (error) {
            console.error('Insert error:', error);
            return { status: 'error', error: { message: error.message, code: error.code, detail: error.detail } };
        }
    }

    async update(where, object): Promise<any> {
        try {
            const response = await this.repository.update(where, object);
            return { status: 'success', response };
        } catch (error) {
            console.error('Update error:', error);
            return { status: 'error', error: { message: error.message, code: error.code, detail: error.detail } };
        }
    }

    async softDelete(where, deleted_by?: number): Promise<any> {
        try {
            if (deleted_by) {
                await this.repository.update(where, { deleted_by: deleted_by } as any);
            }
            const response = await this.repository.softDelete(where);
            return { status: 'success', response };
        } catch (error) {
            return { status: 'error', error };
        }
    }

    async hardDelete(where): Promise<any> {
        try {
            const response = await this.repository.delete(where);
            return { status: 'success', response };
        } catch (error) {
            return { status: 'error', error };
        }
    }

    async executeRawQuery(query: string): Promise<any> {
        const rawData = await this.repository.query(query);
        return rawData;
    }

    async executeRawQueryWithParams(query_obj: { query: string, params: any[] }): Promise<any> {
        const rawData = await this.repository.query(query_obj.query, query_obj.params);
        return rawData;
    }

    async clearGroupByQuery(): Promise<any> {
        // ONLY_FULL_GROUP_BY is already stripped on every pooled connection at startup
        // (see main.ts). Relax the current session too, but NEVER run `SET GLOBAL` —
        // it requires SUPER/SYSTEM_VARIABLES_ADMIN, which the scoped DB user lacks,
        // and it threw a 500 on car search. Session-level is sufficient and safe.
        const query1 = `SET SESSION sql_mode = (SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''));`;
        await this.repository.query(query1);
    }

    removePostfix(obj, paths = {}) {
        // Helper function to check if a key should have a path concatenated
        function concatenatePath(key, value) {
            if (paths.hasOwnProperty(key)) {
                return `${paths[key]}${value}`;
            }
            return value;
        }

        // Check if the current object is an array
        if (Array.isArray(obj)) {
            return obj.map(item => {
                // Apply path concatenation to array items if they are strings
                if (typeof item === 'string') {
                    return concatenatePath('array_item', item); // 'array_item' used to indicate a generic array entry
                }
                return this.removePostfix(item, paths);
            });
        }

        if (obj !== null && typeof obj === 'object') {
            const newObj = {};
    
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    // Remove postfix from the key
                    // _fr included for the Offer module (only entity with French columns so far);
                    // harmless no-op for every other entity, which has no _fr-suffixed columns.
                    const newKey = key.replace(/(_en|_ar|_fr)$/, '');
    
                    // Recursively call removePostfix for nested objects
                    if (obj[key] instanceof Date) {
                        newObj[newKey] = obj[key];
                    } else if (Array.isArray(obj[key])) {
                        // Handle arrays, passing in the original key for concatenation
                        newObj[newKey] = obj[key].map(item => {
                            if (typeof item === 'string') {
                                return concatenatePath(newKey, item); // Use the correct key for path concatenation
                            }
                            return this.removePostfix(item, paths);
                        });
                    } else {
                        newObj[newKey] = this.removePostfix(obj[key], paths);
    
                        // Concatenate path to the value if necessary
                        if (typeof newObj[newKey] === 'string') {
                            newObj[newKey] = concatenatePath(newKey, newObj[newKey]);
                        }
                    }
                }
            }

            return newObj;
        }

        // Return the value if it's not an object or array
        return obj;
    }

    async create(object): Promise<any> {
        return await this.repository.create(object);
    }

    async save(object): Promise<any> {
        return await this.repository.save(object);
    }
}
