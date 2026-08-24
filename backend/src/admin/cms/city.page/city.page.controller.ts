import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Put, Request, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CityPageService } from 'src/cms/city.page/city.page.service';
import { CityPageDetailDto } from './city.page.detail.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { extname } from 'path';
import * as fs from 'fs';
import { CityPageDto } from './city.page.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/city/page')
export class CityPageController {
    constructor(
        @Inject(CityPageService) private cityPageService: CityPageService
    ) {

    }

    @Get(':type')
    async listing(@Param('type') type: string) {
        return await this.cityPageService.getAll({ type })
    }

    @Get(':type/:id')
    async detail(@Param() params: CityPageDetailDto) {
        const response = await this.cityPageService.getOne({ type: params.type, id: params.id });
        if (response) {
            return response;
        }
        throw new NotFoundException();
    }

    @Post()
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/blog`;

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
            if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async store(
        @Body() body: CityPageDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req
    ) {

        if (!image) {
            throw new BadRequestException('Image is required');
        }

        body.image = image.filename;
        body.created_by = req.user.id;

        return await this.cityPageService.insert(body);
    }

    @Put(':id')
    @UseInterceptors(FileInterceptor('image', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const upload_path = `./uploads/admin/blog`;

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
            if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Unsupported file type'), false);
            }
        },
        limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }))
    async update(
        @Param('id') id: number,
        @Body() body: CityPageDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req
    ) {

        const city_page = await this.cityPageService.getOne({ id });

        if (!city_page) {
            throw new NotFoundException()
        }

        if (image) {
            body.image = image.filename;
        }

        body.updated_by = req.user.id;

        return await this.cityPageService.update({ id }, body);
    }
}
