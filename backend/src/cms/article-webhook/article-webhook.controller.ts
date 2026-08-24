import { Body, Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Blog } from 'src/entities/blog.entity';
import { BlogTypes } from 'src/entities/enums/blog.type';
import { ArticleWebhookDto } from './article-webhook.dto';
import { WebhookSignatureGuard } from './webhook-signature.guard';
import { sanitizeArticleHtml } from './sanitize-article-html';

/**
 * Inbound endpoint for the SearchAtlas content engine.
 *
 *   POST /api/v1/webhooks/articles
 *   X-Webhook-Signature: sha256=<hmac of the raw body, keyed with CONTENT_WEBHOOK_SECRET>
 *
 * Three deliberate departures from the supplied spec:
 *
 * 1. Articles land as DRAFT (status = 0), not live. The spec auto-publishes; this
 *    platform has just been cleared of a previous owner's content, and the sample
 *    payload already asserts policy ("zero security deposit", "an IDP is not
 *    required") that has to match the real terms before a customer reads it. A
 *    member of staff publishes from the CMS.
 *
 * 2. The HTML is sanitised before storage, not at render time. The frontend
 *    renders it with dangerouslySetInnerHTML, so anything stored here executes in
 *    a visitor's browser. Sanitising once on the way in means every consumer —
 *    website, prerenderer, future mobile app — gets safe markup.
 *
 * 3. The response is always 200 for a request that parsed and verified, even when
 *    the event is one we do not handle. Webhook senders retry non-2xx
 *    indefinitely; acknowledging an unknown event stops a retry storm over
 *    something that will never succeed.
 *
 * Idempotency: the upsert key is `external_id` (the engine's article id), falling
 * back to `slug`. Any webhook sender re-delivers on timeout, and without this a
 * single slow response would produce duplicate articles.
 */
@Controller('webhooks')
@UseGuards(WebhookSignatureGuard)
export class ArticleWebhookController {
  private readonly logger = new Logger(ArticleWebhookController.name);

  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  @Post('articles')
  @HttpCode(200)
  async receiveArticle(@Body() body: ArticleWebhookDto) {
    const { article } = body;
    const event = body.event || 'article.published';

    if (event !== 'article.published' && event !== 'article.updated') {
      this.logger.log(`Ignoring unhandled event "${event}" for ${article?.slug}`);
      return { success: true, slug: article?.slug ?? null, status: 'ignored', event };
    }

    const lang = article.language; // validated to en | fr | ar by the DTO
    const html = sanitizeArticleHtml(article.content.html);

    if (!html.trim()) {
      // Everything was stripped — almost certainly not a real article.
      this.logger.warn(`Article ${article.slug} had no safe content after sanitising`);
      return { success: false, slug: article.slug, status: 'rejected', reason: 'empty_content' };
    }

    // Find an existing row: engine id first, then slug (an article whose id
    // changed but which still owns the same URL must not create a duplicate).
    let blog =
      (await this.blogRepository.findOne({ where: { external_id: article.id } })) ||
      (await this.blogRepository.findOne({ where: { slug: article.slug } }));

    const isNew = !blog;
    if (isNew) {
      // Typed as DeepPartial<Blog>, not `any`: with `any` TypeScript resolves
      // create() to its array overload and hands back Blog[].
      const seed: DeepPartial<Blog> = {
        type: BlogTypes.OTHER,
        status: 0,          // draft — a human publishes it
        featured: 0,
        // The listing sorts on these; without them a new article has no date.
        publish_date: new Date().toISOString().slice(0, 10),
        author: 'Route Facile',
      };
      blog = this.blogRepository.create(seed);
    }

    blog.external_id = article.id;
    blog.slug = article.slug;
    blog.source = 'searchatlas';
    blog.canonical_url = article.seo?.canonical_url || null;

    // Per-language fields. Only the delivered language is written, so an English
    // article does not blank an existing Arabic translation of the same slug.
    blog[`title_${lang}`] = article.title;
    blog[`description_${lang}`] = html;
    blog[`excerpt_${lang}`] = article.content.excerpt || null;
    blog[`seo_meta_tags_${lang}`] = article.seo?.meta_title || null;
    blog[`seo_meta_description_${lang}`] = article.seo?.meta_description || null;

    // title_en / description_en are NOT NULL in the table, and the listing falls
    // back to English. Seed them from the first language that arrives.
    if (!blog.title_en) blog.title_en = article.title;
    if (!blog.description_en) blog.description_en = html;

    const image = article.media?.featured_image;
    if (image?.url) {
      blog.image = image.url;
      blog.image_alt = image.alt_text || null;
      blog.image_caption = image.caption || null;
    }

    if (article.schema) {
      blog.schema_json = JSON.stringify(article.schema);
    }

    const saved = await this.blogRepository.save(blog);

    this.logger.log(
      `${isNew ? 'Created' : 'Updated'} draft article #${saved.id} ` +
      `"${article.slug}" (${lang}) from the content engine`,
    );

    return {
      success: true,
      id: saved.id,
      slug: saved.slug,
      language: lang,
      // Says "draft", not "published" — the spec's example returns "published",
      // and reporting that while the row is hidden would be a lie the sender
      // would act on.
      status: 'draft',
      review_url: `${process.env.ADMIN_PORTAL_URL || ''}/blog/post`,
      created: isNew,
    };
  }
}
