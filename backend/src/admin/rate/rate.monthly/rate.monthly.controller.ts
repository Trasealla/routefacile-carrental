import { BadRequestException, Body, Controller, Get, Inject, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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
import { RateMonthly } from 'src/entities/rate.monthly.entity';
import { RateMonthlyService } from './rate.monthly.service';
import { RateMonthlyFileService } from './rate.monthly.file.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CarGroupService } from 'src/admin/car/car.group/car.group.service';

import { RateMonthlyListingDto } from '../dtos/rate.monthly.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { CacheBustingService } from 'src/admin/cache.busting.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/rate/monthly')
export class RateMonthlyController {

    constructor(
        @InjectRepository(RateMonthly) private rateMonthlyRepository: Repository<RateMonthly>,
        @Inject(RateMonthlyService) private rateMonthlyService: RateMonthlyService,
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

            if (
                header1[0] == 'Group' &&
                header1[1] == 'Car ID' &&
                header1[2] == 'Car Model' &&
                header1[3] == 'Rate' &&
                header1[4] == 'CDW' &&
                header1[5] == 'SCDW' &&
                header1[6] == 'PAI' &&
                header1[7] == 'Additional Driver' &&
                header1[8] == 'Baby Seat' &&
                header1[9] == 'GPS'
            ) {
                const city_ids = body.city_ids.split(',').map(Number);
                const year = body.year;
                
                const created_by = req.user.id;

                const rateRangeFileObj = {
                    file: file.filename,
                    created_by: created_by
                }

                await this.rateMonthlyService.softDelete({ year: year, city_id: In(city_ids) })

                const RateDailyFileRecord = await this.rateMonthlyFileService.insert(rateRangeFileObj)
                
                const car_groups = await this.carGroupService.getAll({}, ['id', 'name_en']);
                const car_groups_id_name_array = this.carGroupService.getIdNameArray(car_groups.data);

                const data_rows = data.slice(1); // removing header row
                for (const city_id of city_ids) {
                    for (const row of data_rows) {
                        const rateMonthly = new RateMonthly();
                        rateMonthly.city_id = city_id;
                        rateMonthly.group_id = car_groups_id_name_array[row[0]];
                        rateMonthly.car_id = parseInt(row[1]);
                        rateMonthly.year = body.year;
                        rateMonthly.file_id = RateDailyFileRecord.response.identifiers[0].id;;
                        rateMonthly.created_by = created_by;
                        rateMonthly.rate = row[3]
                        rateMonthly.cdw = row[4]
                        rateMonthly.scdw = row[5]
                        rateMonthly.pai = row[6]
                        rateMonthly.driver = row[7]
                        rateMonthly.baby_seat = row[8]
                        rateMonthly.gps = row[9]

                        queryRunner.manager.save(rateMonthly);
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
            throw new Exception(err.stack);
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

        const relations = {
            car: {
                columns: [`name_${lang}`]
            },
            city: {
                columns: [`name_${lang}`]
            },
            car_group: {
                columns: [`name_${lang}`]
            }
        }

        return await this.rateMonthlyService.getAll(where, [], relations, RateMonthlyService.LEFT_JOIN, true, params.page, params.page_size);
    }
}
