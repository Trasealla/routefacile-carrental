import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { CarService } from './car.service';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { getCurrentDateFormatted } from '../utils/date.util';
import { CarDto } from './car.dto';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CarListingDto } from './car.listing.dto';
import { Roles } from 'src/auth/role/roles.decorator';
import { RolesGuard } from 'src/auth/guard/roles.guard';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car')
export class CarController {
    constructor(
        @Inject(CarService) private carService: CarService
    ) { }

    @Post()
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/car/car`;

                    // Create directory if it does not exist
                    fs.mkdir(uploadPath, { recursive: true }, (err) => {
                        if (err) {
                            return cb(err, uploadPath);
                        }
                        cb(null, uploadPath);
                    });
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = getCurrentDateFormatted() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);

                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(jpeg|jpg|png)$/)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type'), false);
                }
            },
            limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
        })
    )
    async store(
        @Body() body: CarDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {
        const image = files.find(file => file.fieldname === 'image');
        const banner_image = files.find(file => file.fieldname === 'banner_image');
        const special_rates_image = files.find(file => file.fieldname === 'special_rates_image');
        const images = files.map(file => {
            if (file.fieldname === 'images') {
                return file.filename;
            }
        });

        if (!image) {
            throw new BadRequestException('Car image is required');
        }

        if (!banner_image) {
            throw new BadRequestException('Car banner image is required');
        }

        if (images.length < 1) {
            throw new BadRequestException('Car images is required');
        }

        body.image = image.filename;
        body.banner_image = banner_image.filename;
        body.images = images.filter(value => (value != null || value != undefined))
        
        // Handle special rates image
        if (special_rates_image) {
            body.special_rates_image = special_rates_image.filename;
        }
        
        // Parse special_rates_cities if sent as JSON string
        if (body.special_rates_cities && typeof body.special_rates_cities === 'string') {
            try {
                body.special_rates_cities = JSON.parse(body.special_rates_cities);
            } catch (e) {
                throw new BadRequestException('Invalid special_rates_cities format. Expected JSON: { all: true } or { all: false, ids: [1, 2, 3] }');
            }
        }
        
        body.created_by = req.user.id;

        return await this.carService.insert(body);
    }

    @Get()
    async listing(@Query() params: CarListingDto) {
        const where = {};
        if (params.category_id) {
            where['category_id'] = params.category_id
        }
        if (params.group_id) {
            where['group_id'] = params.group_id
        }
        if (params.name_en) {
            where['name_en'] = params.name_en
        }
        return await this.carService.getAll(where, [], { group: { columns: ['id', 'name_en'] } }, null, true, params.page, params.page_size, { column: 'entity.status', order: 'DESC' });
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const car = await this.carService.getOne({ id });
        if (!car) {
            throw new NotFoundException('Car not found');
        }
        
        return car;
    }

    @Put(':id')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/car/car`;

                    // Create directory if it does not exist
                    fs.mkdir(uploadPath, { recursive: true }, (err) => {
                        if (err) {
                            return cb(err, uploadPath);
                        }
                        cb(null, uploadPath);
                    });
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = getCurrentDateFormatted() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);

                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(jpeg|jpg|png)$/)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type'), false);
                }
            },
            limits: { fileSize: 2 * 1024 * 1024 }, // 2MB per file
        })
    )
    async update(
        @Param('id') id: number,
        @Body() body: CarDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const car = await this.carService.getOne({ id });
        if (!car) {
            throw new NotFoundException('Car not found');
        }
        if (files) {
            const image = files.find(file => file.fieldname === 'image');
            const banner_image = files.find(file => file.fieldname === 'banner_image');
            const special_rates_image = files.find(file => file.fieldname === 'special_rates_image');
            const images = files
            .filter(file => file.fieldname === 'images')
            .map(file => file.filename);

            if (image) {
                body.image = image.filename
            }

            if (banner_image) {
                body.banner_image = banner_image.filename;
            }

            if (images.length > 0) {
                body.images = images;
            }
            
            // Handle special rates image
            if (special_rates_image) {
                body.special_rates_image = special_rates_image.filename;
            }
        }
        
        // Parse special_rates_cities if sent as JSON string
        if (body.special_rates_cities && typeof body.special_rates_cities === 'string') {
            try {
                body.special_rates_cities = JSON.parse(body.special_rates_cities);
            } catch (e) {
                throw new BadRequestException('Invalid special_rates_cities format. Expected JSON: { all: true } or { all: false, ids: [1, 2, 3] }');
            }
        }
        
        body.updated_by = req.user.id;

        return await this.carService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const car = await this.carService.getOne({ id });
        if (!car) {
            throw new NotFoundException('Car not found');
        }

        await this.carService.update({ id }, { deleted_by: req.user.id });
        return await this.carService.softDelete({ id })
    }
}
