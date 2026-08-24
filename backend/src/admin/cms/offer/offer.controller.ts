import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { ApiExcludeController } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { IsNull } from 'typeorm';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { OfferService } from 'src/cms/offer/offer.service';
import { OfferDto } from './offer.dto';
import * as fs from 'fs';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/offer')
export class OfferController {
    constructor(
        @Inject(OfferService) private offerService: OfferService
    ) { }

    @Get()
    async listing() {
        const offer = await this.offerService.getAll({ deleted_at: IsNull() }, [], { city: { columns: ['id', 'name_en'] } }, OfferService.LEFT_JOIN, true, 1, 100, {column: 'entity_status', order: 'DESC'})
        // const offer = await this.offerService.getAll({}, [], { city: { columns: ['id', 'name_en'] } })

        if (!offer) {
            throw new NotFoundException();
        }

        return offer;
    }

    @Get(':id')
    async details(@Param('id') id: number) {
        const offer = await this.offerService.getOne({ id })

        if (!offer) {
            throw new NotFoundException();
        }

        return offer;
    }

    @Post()
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/offer`;

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
        @Body() body: OfferDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const mobile_image = files.find(file => file.fieldname === 'mobile');
        const desktop_image = files.find(file => file.fieldname === 'desktop');


        if (!desktop_image) {
            throw new BadRequestException('desktop image is required');
        }

        if (!mobile_image) {
            throw new BadRequestException('mobile image is required');
        }

        body.mobile = mobile_image.filename;
        body.desktop = desktop_image.filename;

        body.created_by = req.user.id;

        return await this.offerService.insert(body);
    }

    @Put(':id')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = `./uploads/admin/offer`;

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
        @Body() body: OfferDto,
        @UploadedFiles() files: Express.Multer.File[],
        @Request() req
    ) {

        const offer = await this.offerService.getOne({ id })

        if (!offer) {
            throw new NotFoundException();
        }

        const mobile_image = files.find(file => file.fieldname === 'mobile');
        const desktop_image = files.find(file => file.fieldname === 'desktop');

        if (desktop_image) {
            body.desktop = desktop_image.filename;
        }

        if (mobile_image) {
            body.mobile = mobile_image.filename;
        }

        body.updated_by = req.user.id;

        return await this.offerService.update({ id }, body);
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        const offer = await this.offerService.getOne({ id })

        if (!offer) {
            throw new NotFoundException();
        }

        const result = await this.offerService.hardDelete({ id });

        if (result?.status === 'error') {
            // Offer has dependent records (e.g. offer_enquiries) that block a hard delete;
            // soft-delete instead so it still disappears from the list without losing that history.
            return await this.offerService.softDelete({ id });
        }

        [offer.mobile, offer.desktop].forEach((filename) => {
            if (!filename) return;
            const filePath = `./uploads/admin/offer/${filename}`;
            fs.unlink(filePath, (err) => {
                if (err && err.code !== 'ENOENT') {
                    console.error(`Failed to delete offer image ${filePath}:`, err);
                }
            });
        });

        return result;
    }
}
