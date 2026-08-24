import { Controller, Get, Header } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Blog } from 'src/entities/blog.entity';

const SITE = 'https://routefacilecarrental.com';
const LANGS = ['en', 'fr', 'ar'];

/**
 * Live sitemap for blog articles.
 *
 * The main sitemap.xml is produced at BUILD time from a fixed list of 34 pages,
 * so an article arriving by webhook would not appear in it until the next
 * deploy. Generating this one from the database means a newly published article
 * is discoverable within seconds, with no rebuild.
 *
 * Only published, non-deleted rows are listed. A draft article must never appear
 * in a sitemap — that is an explicit instruction to Google to go and index it.
 *
 * Served publicly and unauthenticated, like any sitemap. It exposes nothing that
 * is not already on the public site.
 */
@Controller()
export class BlogSitemapController {
  constructor(
    @InjectRepository(Blog) private readonly blogRepository: Repository<Blog>,
  ) {}

  @Get('sitemap-blog.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  // Short cache: long enough to absorb crawler bursts, short enough that a newly
  // published article shows up quickly.
  @Header('Cache-Control', 'public, max-age=300')
  async blogSitemap(): Promise<string> {
    const blogs = await this.blogRepository.find({
      where: { status: 1, deleted_at: IsNull() },
      select: ['id', 'slug', 'title_en', 'updated_at', 'publish_date'] as any,
      order: { updated_at: 'DESC' } as any,
    });

    const esc = (s: string) =>
      String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

    const slugFor = (b: Blog) =>
      b.slug || `${String(b.title_en || 'post').toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}-${b.id}`;

    const urls: string[] = [];
    for (const b of blogs) {
      const path = `blogs/${slugFor(b)}`;
      const lastmod = (b.updated_at || b.publish_date || new Date()) as any;
      const iso = new Date(lastmod).toISOString().slice(0, 10);

      for (const lng of LANGS) {
        // Each language variant lists the whole cluster as alternates, so the
        // three versions are understood as translations of one article rather
        // than three competing pages.
        const alternates = LANGS.map(
          (alt) => `      <xhtml:link rel="alternate" hreflang="${alt}" href="${esc(`${SITE}/${alt}/${path}`)}" />`,
        ).join('\n');

        urls.push(
          `    <url>\n` +
          `      <loc>${esc(`${SITE}/${lng}/${path}`)}</loc>\n` +
          `      <lastmod>${iso}</lastmod>\n` +
          `      <changefreq>monthly</changefreq>\n` +
          `      <priority>0.6</priority>\n` +
          `${alternates}\n` +
          `      <xhtml:link rel="alternate" hreflang="x-default" href="${esc(`${SITE}/en/${path}`)}" />\n` +
          `    </url>`,
        );
      }
    }

    return (
      `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
      `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
      `${urls.join('\n')}\n` +
      `</urlset>\n`
    );
  }
}
