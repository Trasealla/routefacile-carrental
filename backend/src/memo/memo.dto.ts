import { Type } from 'class-transformer';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';
import { MemoAccessTargetType, MemoDocumentStatus } from 'src/entities/enums/memo.enums';

// ---------- Categories ----------
export class MemoCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(180)
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsEnum(BasicStatusTypes)
  status: number;

  created_by: number;
  updated_by: number;
}

// ---------- Documents ----------
export class MemoDocumentCreateDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @IsOptional()
  @IsString()
  tags: string;

  created_by: number;
  updated_by: number;
}

export class MemoDocumentUpdateDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsString()
  description: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @IsOptional()
  @IsString()
  tags: string;

  updated_by: number;
}

export class MemoDocumentListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page_size: number = 10;

  @IsOptional()
  @IsString()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @IsOptional()
  @IsEnum(MemoDocumentStatus)
  status: MemoDocumentStatus;

  @IsOptional()
  @IsString()
  date_from: string;

  @IsOptional()
  @IsString()
  date_to: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  uploaded_by: number;
}

// ---------- Versions ----------
export class MemoVersionUploadDto {
  @IsOptional()
  @IsString()
  change_notes: string;
}

// ---------- Access ----------
export class MemoAccessEntryDto {
  @IsEnum(MemoAccessTargetType)
  target_type: MemoAccessTargetType;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  target_value: string;
}

export class MemoAccessAssignDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MemoAccessEntryDto)
  entries: MemoAccessEntryDto[];
}
