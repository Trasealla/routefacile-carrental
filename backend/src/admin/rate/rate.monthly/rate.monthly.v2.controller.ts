import { BadRequestException, Body, Controller, Get, HttpException, Inject, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import * as fs from 'fs';
import { getCurrentDateFormatted } from '../../utils/date.util';
import { extname } from 'path';
import { RateMonthlyDto } from '../dtos/rate.monthly.dto';
import { DataSource, In, Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Exception } from 'handlebars';
import { RateMonthlyFileService } from './rate.monthly.file.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CarGroupService } from 'src/admin/car/car.group/car.group.service';

import { RateMonthlyListingDto } from '../dtos/rate.monthly.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { CacheBustingService } from 'src/admin/cache.busting.service';
import { RateMonthlyV2 } from 'src/entities/rate.monthly.v2.entity';
import { RateMonthlyV2Service } from './rate.monthly.v2.service';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard)
@Controller('admin/rate/monthly/v2')
export class RateMonthlyV2Controller {

    constructor(
        @InjectRepository(RateMonthlyV2) private rateMonthlyRepository: Repository<RateMonthlyV2>,
        @Inject(RateMonthlyV2Service) private rateMonthlyService: RateMonthlyV2Service,
        @Inject(RateMonthlyFileService) private rateMonthlyFileService: RateMonthlyFileService,
        @Inject(CarGroupService) private carGroupService: CarGroupService,
        @Inject(CacheBustingService) private cacheBustingService: CacheBustingService,
        private dataSource: DataSource
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/rate/monthly`;

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
        @Body() body: RateMonthlyDto,
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {

        if(!file){
            throw new BadRequestException('File missing');
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

            // Check for new format with Model Year column (index 15) or legacy format without it
            const hasModelYearColumn = header1[15] === 'Model Year';
            
            if (
                header1[0] == 'Group' &&
                header1[1] == 'TARRIF' &&
                header1[2] == 'Car ID' &&
                header1[3] == 'Car Model' &&
                header1[4] == 'Duration' &&
                header1[5] == 'Mileage' &&
                header1[6] == 'Rate' &&
                header1[7] == 'SCDW' &&
                header1[8] == 'PAI' &&
                header1[9] == 'Additional Driver' &&
                header1[10] == 'Baby Seat' &&
                header1[11] == 'GPS' &&
                header1[12] == 'EXTRA KM 1000' &&
                header1[13] == 'EXTRA KM 2000' &&
                header1[14] == 'EXTRA KM 3000'
            ) {
                const city_ids = body.city_ids.split(',').map(Number);
                const year = body.year;
                const model_year = body.model_year ? parseInt(body.model_year.toString()) : null;
                
                const created_by = req.user.id;

                const rateRangeFileObj = {
                    file: file.filename,
                    created_by: created_by
                }

                // Build delete criteria - include model_year if provided
                const deleteCriteria: any = { year: year, city_id: In(city_ids) };
                if (model_year) {
                    deleteCriteria.model_year = model_year;
                }
                
                await this.rateMonthlyService.softDelete(deleteCriteria)

                const RateDailyFileRecord = await this.rateMonthlyFileService.insert(rateRangeFileObj)
                
                const car_groups = await this.carGroupService.getAll({}, ['id', 'name_en']);
                const car_groups_id_name_array = this.carGroupService.getIdNameArray(car_groups.data);

                const data_rows = data.slice(1); // removing header row
                for (const city_id of city_ids) {
                    for (const row of data_rows) {
                        const rateMonthly = new RateMonthlyV2();
                        rateMonthly.city_id = city_id;
                        rateMonthly.group_id = car_groups_id_name_array[row[0]];
                        rateMonthly.car_id = parseInt(row[2]);
                        rateMonthly.year = body.year;
                        rateMonthly.file_id = RateDailyFileRecord.response.identifiers[0].id;;
                        rateMonthly.created_by = created_by;
                        rateMonthly.months = row[4]
                        rateMonthly.mileage = row[5]
                        rateMonthly.rate = row[6]
                        rateMonthly.scdw = row[7]
                        rateMonthly.pai = row[8]
                        rateMonthly.driver = row[9]
                        rateMonthly.baby_seat = row[10]
                        rateMonthly.gps = row[11]
                        rateMonthly.extra_1000_km_rate = row[12]
                        rateMonthly.extra_2000_km_rate = row[13]
                        rateMonthly.extra_3000_km_rate = row[14]
                        
                        // Set model_year from body parameter or from Excel column (if present)
                        if (hasModelYearColumn && row[15]) {
                            rateMonthly.model_year = parseInt(row[15]);
                        } else if (model_year) {
                            rateMonthly.model_year = model_year;
                        }
                        // If neither is set, model_year remains null (rate applies to all years)
                        
                        await queryRunner.manager.save(RateMonthlyV2, rateMonthly);
                    }
                }
            } else {
                throw new BadRequestException('Wrong file format')
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
            console.error('[RateMonthlyV2Controller.import] Unexpected failure:', err);
            throw new BadRequestException('Could not read the uploaded file. Please check that it matches the sample template and try again.');
        } finally {
            await queryRunner.release();
        }
    }

    @Get()
    async listing(@Query() params: RateMonthlyListingDto) {

        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = {};

        if (params.car_id) {
            where['car_id'] = params.car_id;
        }

        if (params.year) {
            where['year'] = params.year;
        }

        if (params.group_id) {
            where['group_id'] = params.group_id;
        }

        if (params.city_id) {
            where['city_id'] = params.city_id;
        }

        if (params.month) {
            where['month'] = params.month;
        }

        if (params.model_year) {
            where['model_year'] = params.model_year;
        }

        const relations = {
            car: {
                columns: [`name_${lang}`]
            },
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

        return await this.rateMonthlyService.getAll(where, [], relations, RateMonthlyV2Service.LEFT_JOIN, true, params.page, params.page_size);
    }
}
