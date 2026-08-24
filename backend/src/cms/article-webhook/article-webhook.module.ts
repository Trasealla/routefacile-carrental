import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Blog } from 'src/entities/blog.entity';
import { ArticleWebhookController } from './article-webhook.controller';
import { BlogSitemapController } from './blog-sitemap.controller';
import { WebhookSignatureGuard } from './webhook-signature.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Blog])],
  controllers: [ArticleWebhookController, BlogSitemapController],
  providers: [WebhookSignatureGuard],
})
export class ArticleWebhookModule {}
