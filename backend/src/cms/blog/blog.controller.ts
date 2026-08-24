import { Body, Controller, Get, Inject, NotFoundException, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogLanguageTypes } from 'src/entities/enums/blog.language.type';
import { BlogLangDto } from './blog.lang.dto';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { BLOGS_PATH } from 'src/config/contants';
import { BlogListDto } from './blog.list.dto';
import { emit } from 'process';

// categories/tags/city only have name_en/name_ar — no French column yet.
// Fall back to English for those joined names when the blog itself is shown
// in French (same trick the offer module uses for its city relation).
const relationSelectLang = (lang: string) =>
    lang === BlogLanguageTypes.FRENCH ? BlogLanguageTypes.ENGLISH : lang;

@ApiHeader({
    name: 'x-api-key',
    required: true,
    description: 'Api key',
})
@ApiTags('cms')
@Controller('blog')
export class BlogController {

    constructor(
        @Inject(BlogService) private blogService: BlogService
    ) { }

    @Get()
    async listing(@Query() params: BlogListDto) {

        const lang = params.lang || BlogLanguageTypes.ENGLISH;
        const relationLang = relationSelectLang(lang);
        // The status filter was commented out, so this public listing returned
        // every blog row regardless of status — unpublishing a post in the CMS
        // hid it from nobody. The single-post handler below always filtered on
        // status, so a post could be absent from the admin's idea of "published"
        // and still be listed, read and indexed. Restored: `status` means what
        // the CMS says it means.
        const where = { status: BlogService.ACTIVE };
        if (params.featured && params.featured == BlogService.FEATURED) {
            where['featured'] = BlogService.FEATURED;
        }

        if (params.city_id) {
            where['id'] = params.city_id;
        }

        if (params.type) {
            where['type'] = params.type;
        }

        const select = ['id', 'slug', `title_${lang}`, `description_${lang}`, `excerpt_${lang}`, 'image', 'image_alt', 'featured', 'city_id', 'created_at', 'author', 'publish_date'];
        const relations = {
            categories: {
                columns: ['id', `name_${relationLang}`]
            },
            tags: {
                columns: ['id', `name_${relationLang}`]
            },
            city: {
                columns: ['id', `name_${relationLang}`]
            }
        };
        const response = await this.blogService.getAll(where, select, relations, BlogService.LEFT_JOIN, true, params.page, params.page_size, {column: 'entity_id', order: 'DESC'});
        const path = process.env.FILE_SERVER + BLOGS_PATH;
        const response_update = this.blogService.removePostfix(response.data, { image: path })

        return { ...response, data: response_update }
    }

    @Get('/:id')
    async detail(@Param('id') id: number, @Query() params: BlogLangDto) {

        const lang = params.lang || BlogLanguageTypes.ENGLISH;
        const relationLang = relationSelectLang(lang);
        const where = { status: 1, id };
        const select = [
            'id', 'slug', 'source', 'canonical_url', 'schema_json', 'image_alt', 'image_caption',
            `title_${lang}`, `description_${lang}`, `excerpt_${lang}`,
            'image', 'created_at', `seo_meta_tags_${lang}`, `seo_meta_description_${lang}`, 'author', 'publish_date',
        ];
        const relations = {
            categories: {
                columns: ['id', `name_${relationLang}`]
            },
            tags: {
                columns: ['id', `name_${relationLang}`]
            }
        };

        const response = await this.blogService.getOne(where, select, relations, BlogService.LEFT_JOIN);

        if (response) {
            const path = process.env.FILE_SERVER + BLOGS_PATH;
            const response_update = this.blogService.removePostfix(response, { image: path })
            return response_update;
        }

        throw new NotFoundException('Blog not found');
    }
}
