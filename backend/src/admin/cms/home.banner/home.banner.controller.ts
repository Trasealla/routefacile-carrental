import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { HomeBannerService } from 'src/cms/home/home.banner.service';
import * as fs from 'fs';
import { HomeBannerDto } from './home.banner.dto';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/home/banner')
export class HomeBannerController {

    constructor(
        @Inject(HomeBannerService) private homeBannerService: HomeBannerService
    ) { }

    @Get()
    async listing() {
        
        return await this.homeBannerService.getAll({}, [], {}, null, true, 1, 100, { column: 'entity_status', order: 'DESC' });
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const banner = await this.homeBannerService.getOne({ id });

        if (!banner) {
            throw new NotFoundException('Home banner does not exist');
        }

        return await this.homeBannerService.getOne({ id });
    }

    @Post()
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/banner`;

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
        @Body() body: HomeBannerDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const desktop_image = files.find(file => file.fieldname === 'desktop');
        const mobile_image = files.find(file => file.fieldname === 'mobile');


        if (!desktop_image) {
            throw new BadRequestException('desktop banner image is required');
        }

        if (!mobile_image) {
            throw new BadRequestException('mobile banner image is required');
        }

        body.mobile = mobile_image.filename;
        body.desktop = desktop_image.filename;

        body.created_by = req.user.id;

        return await this.homeBannerService.insert(body);
    }

    @Put(':id')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/banner`;

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
        @Body() body: HomeBannerDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const banner = await this.homeBannerService.getOne({ id });

        if (!banner) {
            throw new NotFoundException('Home banner does not exist');
        }
        if (files) {
            const desktop_image = files.find(file => file.fieldname === 'desktop');
            const mobile_image = files.find(file => file.fieldname === 'mobile');

            if (mobile_image) {
                body.mobile = mobile_image.filename;
            }

            if (desktop_image) {
                body.desktop = desktop_image.filename;
            }
        }

        body.updated_by = req.user.id;

        return await this.homeBannerService.update({ id }, body);
    }
}
