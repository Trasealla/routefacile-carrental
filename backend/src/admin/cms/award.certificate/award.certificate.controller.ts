import { BadRequestException, Body, Controller, Get, Inject, NotFoundException, Param, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { AwardCertificateService } from 'src/cms/award.certificate/award.certificate.service';
import * as fs from 'fs';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { extname } from 'path';
import { AwardCertificateDto } from './award.certificate.dto';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/award/certificate')
export class AwardCertificateController {

    constructor(
        @Inject(AwardCertificateService) private awardCertificateService: AwardCertificateService
    ) { }

    @Get()
    async listing() {
        return await this.awardCertificateService.getAll();
    }

    @Get(':id')
    async detail(@Param('id') id: number) {
        const ac = await this.awardCertificateService.getOne({ id });

        if (!ac) {
            throw new NotFoundException('Home banner does not exist');
        }

        return await this.awardCertificateService.getOne({ id });
    }

    @Post()
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/awards_and_certificates`;

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
        @Body() body: AwardCertificateDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {
       
        const desktop_image = files.find(file => file.fieldname === 'desktop');
        const mobile_image = files.find(file => file.fieldname === 'mobile');


        if (!desktop_image) {
            throw new BadRequestException('desktop image is required');
        }

        if (!mobile_image) {
            throw new BadRequestException('mobile banner image is required');
        }

        body.mobile = mobile_image.filename;
        body.desktop = desktop_image.filename;

        body.created_by = req.user.id;

        return await this.awardCertificateService.insert(body);
    }

    @Put(':id')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/awards_and_certificates`;

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
        @Body() body: AwardCertificateDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const ac = await this.awardCertificateService.getOne({ id });

        if (!ac) {
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

        return await this.awardCertificateService.update({ id }, body);
    }
}
