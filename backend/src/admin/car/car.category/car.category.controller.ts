import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { CarCategoryService } from './car.category.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { CarCategoryDto } from './car.category.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { extname } from 'path';
import * as fs from 'fs';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/car-category')
export class CarCategoryController {
    constructor(
        @Inject(CarCategoryService) private carCategoryService: CarCategoryService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {
        return await this.carCategoryService.getAll({}, [], {}, null, true, params.page, params.page_size, { column: 'entity.sort_order', order: 'ASC' });
    }

    @Put('reorder')
    async reorder(@Body() body: { ordered_ids: number[] }) {
        if (!body.ordered_ids || !Array.isArray(body.ordered_ids) || body.ordered_ids.length === 0) {
            throw new BadRequestException('ordered_ids is required and must be a non-empty array');
        }
        return await this.carCategoryService.reorder(body.ordered_ids);
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const respone = await this.carCategoryService.getOne({ id });

        if (respone) {
            return respone;
        }

        throw new NotFoundException();
    }


    @Post()
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/car/category`;

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
            if (file.mimetype.match(/\/(jpg|jpeg|png|svg)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async store(
        @Body() body: CarCategoryDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req
    ) {
        if (!image) {
            throw new BadRequestException('image is required');
        }

        body.image = image.filename;
        body.created_by = req.user.id

        return await this.carCategoryService.insert(body);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/car/category`;

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
            if (file.mimetype.match(/\/(jpg|jpeg|png|svg\+xml|webp)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async update(
        @Param('id') id: number,
        @Body() body: CarCategoryDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req) {

        const respone = await this.carCategoryService.getOne({ id });

        if (respone) {
            if (image) {
                body.image = image.filename;
            }
            body.updated_by = req.user.id;
            return await this.carCategoryService.update({ id }, body)
        }

        throw new NotFoundException();
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {

        const respone = await this.carCategoryService.getOne({ id });

        if (respone) {
            await this.carCategoryService.update({ id }, { deleted_by: req.user.id })
            return await this.carCategoryService.softDelete({ id })
        }

        throw new NotFoundException();
    }
}
