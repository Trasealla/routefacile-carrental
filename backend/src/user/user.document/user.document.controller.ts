import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Request, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserDocumentService } from './user.document.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { UserDocumentDto } from '../dtos/user.document.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { IsNull } from 'typeorm';

@ApiHeader({
    name: 'Authorization',
    required: true,
    description: 'Bearer token',
})
@ApiTags('user')
@UseGuards(JwtAuthGuard)
@Controller('user/document')
export class UserDocumentController {

    constructor(
        @Inject(UserDocumentService) private userDocumentService: UserDocumentService
    ) { }

    @Get(':user_id')
    async listing(@Param('user_id') user_id: number) {
        const path = `${process.env.FILE_SERVER}/user/${user_id}/`
        const response = await this.userDocumentService.getAll({ user_id });
        const response_update = this.userDocumentService.removePostfix(response.data, { front_image: path, back_image: path })

        return response_update
    }

    @Post()
    @UseInterceptors(
        AnyFilesInterceptor({
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const user_id = req.body.user_id;
                    const upload_path = `./uploads/user/${user_id}`;
                    fs.mkdir(upload_path, { recursive: true }, (err) => {
                        if (err) {
                            return cb(err, upload_path);
                        }
                        cb(null, upload_path);
                    });
                },
                filename: (req, file, cb) => {
                    const doc_type = req.body.doc_type;
                    const uniqueSuffix = Date.now() + '-' + doc_type;
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, cb) => {
                if (file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) {
                    cb(null, true);
                } else {
                    cb(new BadRequestException('Unsupported file type'), false);
                }
            },
            limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
        })
    )
    async store(
        @UploadedFiles() files: Express.Multer.File[],
        @Body() body: UserDocumentDto
    ) {
        const front_image = files.find(file => file.fieldname === 'front_image');
        const back_image = files.find(file => file.fieldname === 'back_image');
        if (!front_image) {
            throw new BadRequestException('front_image is required');
        }
        body.front_image = front_image.filename
        body.back_image = back_image ? back_image.filename : null

        const delete_where = {
            doc_type: body.doc_type,
            deleted_at: IsNull(),
            user_id: body.user_id
        };
        await this.userDocumentService.softDelete(delete_where)

        return await this.userDocumentService.insert(body);;
    }

    @Delete(':doc_id')
    async delete(@Param('doc_id') doc_id: number) {

        const doc = await this.userDocumentService.getOne({ id: doc_id });
        if (doc) {
            return await this.userDocumentService.softDelete({ id: doc_id });
        }

        return new NotFoundException();
    }
}
