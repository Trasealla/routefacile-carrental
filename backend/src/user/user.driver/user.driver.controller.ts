import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Post, Put, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserDriverDto } from '../dtos/user.driver.dto';
import { UserService } from '../user.service';
import { UserDriverService } from './user.driver.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { UserDriverDocumentService } from './user.driver.document.service';
import { UserDriverDocumentDto } from '../dtos/user.driver.document.dto';
import { Column, IsNull } from 'typeorm';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user/driver')
export class UserDriverController {

    constructor(
        @Inject(UserService) private userService: UserService,
        @Inject(UserDriverService) private userDriverService: UserDriverService,
        @Inject(UserDriverDocumentService) private userDriverDocumentService: UserDriverDocumentService,
    ) { }


    @Get()
    async index(@Request() req) {
        const email = req.user.email;

        const user_where = { email }
        const relation = {
            drivers: {
                columns: ['id', 'first_name', 'last_name', 'email', 'phone_code', 'phone_number']
            }
        };
        const user = await this.userService.getOne(user_where, [], relation, UserService.LEFT_JOIN);

        if (user) {
            return user.drivers;
        }

        throw new BadRequestException('User not found');
    }

    @Get(':id')
    async detail(@Param('id') id: number, @Request() req) {
        const email = req.user.email;

        const user_where = { email }

        const user = await this.userService.getOne(user_where, ['id']);

        if (user) {
            const user_driver_where = { user_id: user.id, id }
            const user_driver = await this.userDriverService.getOne(user_driver_where);
            return user_driver;
        }

        throw new BadRequestException('User not found');
    }

    @Post()
    async store(@Body() body: UserDriverDto, @Request() req) {
        const email = req.user.email;

        const user_where = { email }
        const user_select = ['id'];
        const user = await this.userService.getOne(user_where, user_select);

        if (user) {
            body.user_id = user.id;
            body.status = UserDriverService.ACTIVE;
            return await this.userDriverService.insert(body)
        }

        throw new BadRequestException('User not found');
    }

    @Put(':id')
    async update(@Param('id') id: number, @Body() body: UserDriverDto) {

        const where = { id }
        const select = ['id'];
        const user_driver = await this.userDriverService.getOne(where, select);

        if (user_driver) {
            return await this.userDriverService.update(where, body)
        }

        throw new BadRequestException('User Driver not found');
    }

    @Delete(':id')
    async delete(@Param('id') id: number, @Request() req) {
        const user_id = req.user.id;
        const where = { id, user_id }
        const select = ['id'];
        const user_driver = await this.userDriverService.getOne(where, select);

        if (user_driver) {
            return await this.userDriverService.hardDelete(where)
        }

        throw new BadRequestException('User Driver not found');
    }

    @Post('document')
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const user_id = req.body.user_id;
                    const doc_type = req.body.doc_type;
                    const doc_set_type = req.body.doc_set_type;
                    const user_driver = req.body.user_driver_id;
                    const upload_path = `./uploads/user/${user_id}/${user_driver}/${doc_set_type}/${doc_type}`;

                    fs.mkdir(upload_path, { recursive: true }, (err) => {
                        if (err) {
                            return cb(err, upload_path);
                        }
                        cb(null, upload_path);
                    });
                },
                filename: (req, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
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
        })
    )
    async storeDocument(
        @Body() body: UserDriverDocumentDto,
        @UploadedFiles() files: Express.Multer.File[]
    ) {

        const where = { id: body.user_driver_id }
        const select = ['id'];
        const user_driver = await this.userDriverService.getOne(where, select);

        if (user_driver) {
            const front_image = files.find(file => file.fieldname === 'front_image');
            const back_image = files.find(file => file.fieldname === 'back_image');
            if (!front_image) {
                throw new BadRequestException('front_image is required');
            }
            body.front_image = front_image.filename
            body.back_image = back_image ? back_image.filename : null
            body.user_driver_id = body.user_driver_id;
            const delete_where = {
                doc_type: body.doc_type,
                doc_set_type: body.doc_set_type,
                deleted_at: IsNull()
            };
            await this.userDriverDocumentService.softDelete(delete_where)

            return await this.userDriverDocumentService.insert(body);;
        }

        throw new BadRequestException('User Driver not found');
    }

    @Get('document/:doc_set_type/:user_driver_id')
    async listing(@Param('doc_set_type') doc_set_type: string, @Param('user_driver_id') user_driver_id: number) {

        const path = `${process.env.FILE_SERVER}/user/[user_id]/[user_driver_id][doc_set_type]/[doc_type]/`
        const response = await this.userDriverDocumentService.getAll({ user_driver_id, doc_set_type });
        const response_update = this.userDriverDocumentService.removePostfix(response.data, { front_image: path, back_image: path })

        return response_update
    }
}
