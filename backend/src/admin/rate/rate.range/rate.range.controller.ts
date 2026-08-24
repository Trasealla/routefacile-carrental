import { BadRequestException, Body, Controller, Get, HttpException, Inject, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as XLSX from 'xlsx';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { excelDateToString, getCurrentDateFormatted } from '../../utils/date.util';
import { DataSource, In, IsNull, LessThanOrEqual, MoreThanOrEqual, Not, QueryRunner, Repository } from 'typeorm';
import { Exception } from 'handlebars';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { CarGroupService } from 'src/admin/car/car.group/car.group.service';
import { InjectRepository } from '@nestjs/typeorm';
import { RateRangeDto } from '../dtos/rate.range.dto';
import { RateRange } from 'src/entities/rate.range.entity';
import { RateRangeFileService } from './rate.range.file.service';
import { RateRangeService } from './rate.range.service';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { RateRangeListingDto } from '../dtos/rate.range.listing.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { LocationService } from 'src/location/location.service';
import { CacheBustingService } from 'src/admin/cache.busting.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/rate/range')
export class RateRangeController {

    constructor(
        @InjectRepository(RateRange) private rateRangeRepository: Repository<RateRange>,
        @Inject(RateRangeFileService) private rateRangeFileService: RateRangeFileService,
        @Inject(RateRangeService) private rateRangeService: RateRangeService,
        @Inject(CarGroupService) private carGroupService: CarGroupService,
        @Inject(LocationService) private locationService: LocationService,
        @Inject(CacheBustingService) private cacheBustingService: CacheBustingService,
        private dataSource: DataSource
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/rate/range`;

                // Create directory if it does not exist
                fs.mkdir(upload_path, { recursive: true }, (err) => {
                    if (err) {
                        return cb(err, upload_path);
                    }
                    cb(null, upload_path);
                });
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = getCurrentDateFormatted() + '-' + Math.round(Math.random() * 1E9);
                const ext = extname(file.originalname);

                cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(vnd\.ms-excel|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async import(
        @Body() body: RateRangeDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {

        if(!file){
            throw new BadRequestException('File missing');
        }

        // Determine if form-level dates are provided
        const useFormDates = !!(body.start_date && body.end_date);

        if (useFormDates) {
            const formStart = new Date(body.start_date);
            const formEnd = new Date(body.end_date);
            if (formEnd < formStart) {
                throw new BadRequestException('End date cannot be before start date');
            }
        }

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const workbook = XLSX.readFile(file.path);
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            const header1 = data[0];

            // Support two Excel formats:
            // Format A (with form dates): CAR GROUP | START DAY | END DAY | AMOUNT
            // Format B (original):        CAR GROUP | START DATE | END DATE | START DAY | END DAY | AMOUNT
            const isSimpleFormat = useFormDates &&
                header1[0].trim() == 'CAR GROUP' &&
                header1[1].trim() == 'START DAY' &&
                header1[2].trim() == 'END DAY' &&
                header1[3].trim() == 'AMOUNT';

            const isFullFormat =
                header1[0].trim() == 'CAR GROUP' &&
                header1[1].trim() == 'START DATE(DD-MM-YYYY Format)' &&
                header1[2].trim() == 'END DATE (DD-MM-YYYY Format)' &&
                header1[3].trim() == 'START DAY' &&
                header1[4].trim() == 'END DAY' &&
                header1[5].trim() == 'AMOUNT';

            if (!isSimpleFormat && !isFullFormat) {
                throw new BadRequestException('Wrong file format');
            }

            const data_rows = data.slice(1); // removing header row

            const city_ids = body.city_ids.split(',').map(Number);

            const location_ids = body.location_ids ? body.location_ids.split(',').map(Number) : [];

            const db_locations = await this.locationService.getAll({ status: 1, pickup: 1 }, ['id', 'city_id']);

            const city_location_base_array = this.locationService.getBaseArray(db_locations.data, location_ids, city_ids);

            const created_by = req.user.id;

            const rateRangeFileObj = {
                file: file.filename,
                created_by: created_by
            }
            //    const soft_delete_where = location_ids.length ? { city_id: In(city_ids), location_id: In(location_ids) } : { city_id: In(city_ids), location_id: IsNull() };
            //    await this.rateRangeService.softDelete(soft_delete_where, created_by)

            const RateDailyFileRecord = await this.rateRangeFileService.insert(rateRangeFileObj)

            for (const city_id of city_ids) {
                for (const row of data_rows) {
                    const car_group_name = row[0];
                    const car_group = await this.carGroupService.getOne({ name_en: car_group_name }, ['id', 'name_en']);
                    if (car_group) {
                        // Parse row based on format
                        const rowData = isSimpleFormat
                            ? { start_date: body.start_date, end_date: body.end_date, from: row[1], to: row[2], rate: row[3] }
                            : { start_date: useFormDates ? body.start_date : excelDateToString(row[1]), end_date: useFormDates ? body.end_date : excelDateToString(row[2]), from: row[3], to: row[4], rate: row[5] };

                        if (location_ids.length > 0) {
                            const l_ids = city_location_base_array[city_id];
                            for (const location_id of l_ids) {
                                await this.createRateRange(
                                    location_id,
                                    city_id,
                                    rowData,
                                    car_group.id,
                                    RateDailyFileRecord.response.identifiers[0].id,
                                    created_by,
                                    queryRunner
                                );
                            }
                        } else {
                            await this.createRateRange(
                                null,
                                city_id,
                                rowData,
                                car_group.id,
                                RateDailyFileRecord.response.identifiers[0].id,
                                created_by,
                                queryRunner
                            );
                        }

                    }
                }
            }

            this.cacheBustingService.bustHomeRates();
            await queryRunner.commitTransaction();
            return { status: true, msg: 'import successful' };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            // Preserve deliberate validation errors ("Wrong file format" etc). Anything
            // else is unexpected — log it server-side and return a clean message rather
            // than sending the raw stack trace to the browser.
            if (err instanceof HttpException) {
                throw err;
            }
            console.error('[RateRangeController.import] Unexpected failure:', err);
            throw new BadRequestException('Could not read the uploaded file. Please check that it matches the sample template and try again.');
        } finally {
            await queryRunner.release();
        }
    }

    async createRateRange(location_id: number, city_id: number, rowData: { start_date: string, end_date: string, from: number, to: number, rate: number }, car_group_id: number, file_id: number, created_by: number, queryRunner: QueryRunner) {
        const rateRange = new RateRange();
        rateRange.location_id = location_id;
        rateRange.city_id = city_id;
        rateRange.from = rowData.from;
        rateRange.to = rowData.to;
        rateRange.start_date = rowData.start_date;
        rateRange.end_date = rowData.end_date;
        rateRange.group_id = car_group_id;
        rateRange.file_id = file_id;
        rateRange.created_by = created_by;
        rateRange.rate = rowData.rate;

        await queryRunner.manager.save(RateRange, rateRange)
    }

    @Get()
    async listing(@Query() params: RateRangeListingDto) {

        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = {};


        if (params.group_id) {
            where['group_id'] = params.group_id;
        }

        if (params.city_id) {
            where['city_id'] = params.city_id;
        }

        if (params.location_id) {
            where['location_id'] = params.location_id;
        }

        if (params.start_date) {
            where['start_date'] = MoreThanOrEqual(params.start_date);
        }

        if (params.end_date) {
            where['end_date'] = LessThanOrEqual(params.end_date);
        }

        const relations = {
            city: {
                columns: [`name_${lang}`]
            },
            car_group: {
                columns: [`name_${lang}`]
            },
            created_by_admin: {
                columns: [`email`, `first_name`]
            }
        }

        return await this.rateRangeService.getAll(where, [], relations, RateRangeService.LEFT_JOIN, true, params.page, params.page_size, { column: 'entity_id', order: 'DESC' });
    }
}
