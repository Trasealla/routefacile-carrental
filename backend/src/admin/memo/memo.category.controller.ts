import { Body, Controller, Delete, Get, Inject, NotFoundException, Param, Post, Put, Query, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AdminJwtAuthGuard } from 'src/auth/guard/admin-jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/role/roles.decorator';
import { PaginationDto } from 'src/dtos/pagination.dto';
import { MemoCategoryService } from 'src/memo/memo.category.service';
import { MemoDocumentService } from 'src/memo/memo.document.service';
import { MemoCategoryDto } from 'src/memo/memo.dto';

@ApiExcludeController()
@UseGuards(AdminJwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin/memo/categories')
export class AdminMemoCategoryController {
  constructor(
    @Inject(MemoCategoryService) private categoryService: MemoCategoryService,
    @Inject(MemoDocumentService) private documentService: MemoDocumentService,
  ) { }

  @Get()
  async listing(@Query() params: PaginationDto) {
    const result = await this.categoryService.getAll({}, [], {}, null, true, params.page, params.page_size, { column: 'entity.name', order: 'ASC' });
    await this.attachDocumentCounts(result.data);
    return result;
  }

  @Get('active')
  async active() {
    const result = await this.categoryService.getAll({ status: 1 }, ['id', 'name', 'slug']);
    await this.attachDocumentCounts(result.data);
    return result;
  }

  private async attachDocumentCounts(rows: any[]) {
    if (!rows || rows.length === 0) return;
    const ids = rows.map(r => r.id);
    const counts = await this.documentService.repo
      .createQueryBuilder('d')
      .select('d.category_id', 'category_id')
      .addSelect('COUNT(*)', 'cnt')
      .where('d.category_id IN (:...ids)', { ids })
      .andWhere('d.deleted_at IS NULL')
      .groupBy('d.category_id')
      .getRawMany();
    const map = new Map<number, number>(counts.map(c => [Number(c.category_id), Number(c.cnt)]));
    rows.forEach(r => { r.documents_count = map.get(Number(r.id)) || 0; });
  }

  @Get(':id')
  async detail(@Param('id') id: number) {
    const row = await this.categoryService.getOne({ id });
    if (!row) throw new NotFoundException();
    return row;
  }

  @Post()
  async create(@Body() body: MemoCategoryDto, @Request() req) {
    body.created_by = req.user.id;
    return await this.categoryService.insert(body);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() body: MemoCategoryDto, @Request() req) {
    const row = await this.categoryService.getOne({ id });
    if (!row) throw new NotFoundException();
    body.updated_by = req.user.id;
    return await this.categoryService.update({ id }, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: number, @Request() req) {
    const row = await this.categoryService.getOne({ id });
    if (!row) throw new NotFoundException();
    const inUse = await this.documentService.repo.count({ where: { category_id: id } as any });
    if (inUse > 0) {
      throw new BadRequestException('Category is in use by one or more documents');
    }
    await this.categoryService.update({ id }, { deleted_by: req.user.id });
    return await this.categoryService.softDelete({ id });
  }
}
