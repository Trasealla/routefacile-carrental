import { BadRequestException, Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { BlogService } from 'src/cms/blog/blog.service';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import { extname } from 'path';
import { getCurrentDateFormatted } from 'src/admin/utils/date.util';
import { BlogDto } from './blog.dto';
import { BlogTagService } from './blog.tag.service';
import { In } from 'typeorm';
import { BlogCategoryService } from './blog.category.service';
import { Blog } from 'src/entities/blog.entity';
import { BlogTag } from 'src/entities/blog.tag.entity';
import { BlogCategory } from 'src/entities/blog.category.entity';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/blog')
export class BlogController {

    constructor(
        @Inject(BlogService) private blogService: BlogService,
        @Inject(BlogTagService) private blogTagService: BlogTagService,
        @Inject(BlogCategoryService) private blogCategoryService: BlogCategoryService
    ) { }

    @Get()
    async listing(@Query() params: PaginationDto) {

        // { data, total_records } — same shape every other admin list endpoint
        // (cars, offers, ...) returns, so the admin frontend's list page can use
        // its one shared pagination pattern instead of a blog-specific one.
        const relations = { tags: { columns: ['id', 'name_en'] }, categories: { columns: ['id', 'name_en'] } };
        const response = await this.blogService.getAll({}, [], relations, BlogService.LEFT_JOIN, true, params.page, params.page_size);

        return response;
    }

    // Populates the category/tag checkboxes on the admin blog form — no route
    // exposed these before because nothing needed to list them until now.
    @Get('category')
    async categoryList() {
        return this.blogCategoryService.getAll({});
    }

    @Get('tag')
    async tagList() {
        return this.blogTagService.getAll({});
    }

    @Get(':id')
    async detail(@Param('id') id: number) {

        const relations = { tags: { columns: ['id', 'name_en', 'name_ar'] }, categories: { columns: ['id', 'name_en', 'name_ar'] } }
        const respone = await this.blogService.getOne({ id }, [], relations, BlogService.LEFT_JOIN);

        if (respone) {
            return respone;
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
        @Body() body: BlogDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req
    ) {
        if (!image) {
            throw new BadRequestException('image is required');
        }
        const { tag_ids, category_ids, ...blog } = body;
        blog.image = image.filename;
        blog.created_by = req.user.id
        blog.status = BlogService.ACTIVE;

        const new_blog = await this.blogService.create(blog) as Blog;

        const tags = await this.blogTagService.getAll({ id: In(tag_ids) });
        const categories = await this.blogCategoryService.getAll({ id: In(category_ids) });

        new_blog.tags = tags.data as BlogTag[]
        new_blog.categories = categories.data as BlogCategory[];

        await this.blogService.save(new_blog)

        return new_blog;
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
        @Body() body: BlogDto,
        @UploadedFile() image: Express.Multer.File,
        @Request() req
    ) {

        const relations = { tags: { columns: ['id'] }, categories: { columns: ['id'] } }
        const blog = await this.blogService.getOne({ id }, [], relations, BlogService.LEFT_JOIN) as Blog;

        if (!blog) {
            throw new NotFoundException(`Blog with ID ${id} not found`);
        }

        if (image) {
            body.image = image.filename;
        }

        const { tag_ids, category_ids, ...blogData } = body;

        blogData.updated_by = req.user.id;

        blog.tags = []; // disassociation
        blog.categories = []; // disassociation

        if (tag_ids && tag_ids.length > 0) {
            const tags = await this.blogTagService.getAll({ id: In(tag_ids) });
            blog.tags = tags.data as BlogTag[];
        }

        if (category_ids && category_ids.length > 0) {
            const categories = await this.blogCategoryService.getAll({ id: In(category_ids) });
            blog.categories = categories.data as BlogCategory[];
        }

        await this.blogService.save(blog);
        const response = await this.blogService.update({ id }, blogData);

        return response;
    }

    @Delete(':id')
    async delete(@Param('id') id: number) {
        return this.blogService.softDelete({ id })
    }
}
