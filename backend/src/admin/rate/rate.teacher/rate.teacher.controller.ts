import { BadRequestException, Controller, Get, Inject, Post, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import * as fs from 'fs';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { extname } from 'path';
import { DataSource, MoreThan } from 'typeorm';
import { RateTeacherService } from './rate.teacher.service';
import { CarService } from 'src/car/car.service';
import * as XLSX from 'xlsx';
import { Exception } from 'handlebars';
import { RateTeacher } from 'src/entities/rate.teacher.entity';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { LanguageTypes } from 'src/entities/enums/language.type';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/rate/teacher')
export class RateTeacherController {

    constructor(
        @Inject(RateTeacherService) private RateTeacherService: RateTeacherService,
        @Inject(CarService) private carService: CarService,
        private dataSource: DataSource
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/rate/teacher`;

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
        @UploadedFile() file: Express.Multer.File,
        @Request() req
    ) {
        if (!file) {
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
            const header = data[0];
            
            if (
                header[0] == 'CAR ID' &&
                header[1] == 'CAR NAME' &&
                header[2] == 'RATE'
            ) {

                const data_rows = data.slice(1); // removing header rows

                const created_by = req.user.id;

                await this.RateTeacherService.hardDelete({ id: MoreThan(0) });
                
                for (const row of data_rows) {
                    if(row[0]){
                        const car = await this.carService.getOne({ id: row[0] }, ['id']);
                        const rateTeacher = new RateTeacher();
                        
                        rateTeacher.car_id = car.id;
                        rateTeacher.rate = row[2];
                        rateTeacher.created_by = created_by

                        await queryRunner.manager.insert(RateTeacher, rateTeacher);    
                    }
                }
            } else {
                throw new BadRequestException('Wrong file format')
            }
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
    async listing(@Query() params: PaginationDto) {

        const lang = params.lang || LanguageTypes.ENGLISH;
        const where = {};

        const relations = {
            car: {
                columns: [`name_${lang}`]
            },
            created_by_admin: {
                columns: [`email`, `first_name`]
            }
        }

        return await this.RateTeacherService.getAll(where, [], relations, RateTeacherService.LEFT_JOIN, true, params.page, params.page_size);
    }
}
