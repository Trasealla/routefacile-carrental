import { BadRequestException, Body, Controller, Get, Inject, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RateDailyDto } from '../dtos/rate.daily.dto';
import * as XLSX from 'xlsx';
import { RateDailyService } from './rate.daily.service';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import { createDateString, getCurrentDateFormatted, getDaysInMonth, isWeekday } from '../../utils/date.util';
import { DataSource, In, Not, Repository } from 'typeorm';
import { Exception } from 'handlebars';
import { RateDailyFileService } from './rate.daily.file.service';
import { RateDaily } from 'src/entities/rate.daily.entity';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { DayTypes } from 'src/entities/enums/day.type';
import { CarGroupService } from 'src/admin/car/car.group/car.group.service';
import { InjectRepository } from '@nestjs/typeorm';
import { CarService } from 'src/car/car.service';
import { isNumber } from 'class-validator';
import { RateDailyListingDto } from '../dtos/rate.daily.listing.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';
import { ApiExcludeController } from '@nestjs/swagger';
import { CacheBustingService } from 'src/admin/cache.busting.service';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/rate/daily')
export class RateDailyController {

    constructor(
        @Inject(RateDailyService) private RateDailyService: RateDailyService,
        @InjectRepository(RateDaily) private RateDailyRepository: Repository<RateDaily>,
        @Inject(RateDailyFileService) private RateDailyFileService: RateDailyFileService,
        @Inject(CarGroupService) private carGroupService: CarGroupService,
        @Inject(CarService) private carService: CarService,
        @Inject(CacheBustingService) private cacheBustingService: CacheBustingService,
        private dataSource: DataSource
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/rate/daily`;

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
        @Body() body: RateDailyDto,
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
            const header2 = data[1];

            if (
                header1[3] == 'Weekday' &&
                header1[10] == 'Weekend' &&
                header2[0] == 'Group' &&
                header2[1] == 'Month' &&
                header2[2] == 'Month Name' &&
                header2[3] == 'Rate' && // normal day
                header2[4] == 'CDW' &&
                header2[5] == 'SCDW' &&
                header2[6] == 'PAI' &&
                header2[7] == 'GPS' &&
                header2[8] == 'Baby Seat' &&
                header2[9] == 'Driver Fee' &&
                header2[10] == 'Rate' && // weekend
                header2[11] == 'CDW' &&
                header2[12] == 'SCDW' &&
                header2[13] == 'PAI' &&
                header2[14] == 'GPS' &&
                header2[15] == 'Baby Seat' &&
                header2[16] == 'Driver Fee'
            ) {

                const data_rows = data.slice(2); // removing header rows

                const year = Number(body.year);
                const city_ids = body.city_ids.split(',').map(Number);
                
                const created_by = req.user.id;
                const car_groups = await this.carGroupService.getAll({}, ['id', 'name_en']);
                const car_groups__id_name_array = this.carGroupService.getIdNameArray(car_groups.data);

                const RateDailyFileObj = {
                    file: file.filename,
                    created_by: created_by
                }

                await this.RateDailyService.hardDelete({ year: year, city_id: In(city_ids) });

                const RateDailyFileRecord = await this.RateDailyFileService.insert(RateDailyFileObj)

                for (const city_id of city_ids) {
                    for (const row of data_rows) {
                        const month_days = getDaysInMonth(row[1], year);
                        const rateDailyArr: RateDaily[] = [];
                        for (let day = 1; day <= month_days; day++) {
                            const cars = await this.carService.getAll({ group_id: car_groups__id_name_array[row[0]] }, ['id', 'group_id']);
                            for (const car of cars.data) {
                                const rateDaily = new RateDaily();
                                rateDaily.year = year;
                                rateDaily.month = row[1];
                                rateDaily.date = createDateString(day, parseInt(row[1]), year) // generate date from day, month, year
                                rateDaily.city_id = city_id;
                                rateDaily.group_id = car.group_id;
                                rateDaily.file_id = RateDailyFileRecord.response.identifiers[0].id;
                                rateDaily.car_id = car.id;
                                rateDaily.created_by = created_by;
                                if (isWeekday(day, parseInt(row[1]), year)) {
                                    rateDaily.day_type = DayTypes.NORMAL
                                    rateDaily.rate = row[3];
                                    rateDaily.cdw = (row[4] && isNumber(row[4])) ? row[4] : null;
                                    rateDaily.scdw = (row[5] && isNumber(row[5])) ? row[5] : null;
                                    rateDaily.pai = (row[6] && isNumber(row[6])) ? row[6] : null;
                                    rateDaily.gps = (row[7] && isNumber(row[7])) ? row[7] : null;
                                    rateDaily.baby_seat = (row[8] && isNumber(row[8])) ? row[8] : null;
                                    rateDaily.driver = (row[9] && isNumber(row[9])) ? row[9] : null;

                                } else {
                                    rateDaily.day_type = DayTypes.WEEKEND
                                    rateDaily.rate = row[10];
                                    rateDaily.cdw = (row[11] && isNumber(row[11])) ? row[11] : null;
                                    rateDaily.scdw = (row[12] && isNumber(row[12])) ? row[12] : null;
                                    rateDaily.pai = (row[13] && isNumber(row[13])) ? row[13] : null;
                                    rateDaily.gps = (row[14] && isNumber(row[14])) ? row[14] : null;
                                    rateDaily.baby_seat = (row[15] && isNumber(row[15])) ? row[15] : null;
                                    rateDaily.driver = (row[16] && isNumber(row[16])) ? row[16] : null;
                                }
                                rateDailyArr.push(rateDaily)
                            }
                        }
                        await queryRunner.manager.insert(RateDaily, rateDailyArr);
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
    async listing(@Query() params: RateDailyListingDto) {

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
            },
            created_by_admin: {
                columns: [`email`, `first_name`]
            }
        }

        return await this.RateDailyService.getAll(where, [], relations, RateDailyService.LEFT_JOIN, true, params.page, params.page_size);
    }
}