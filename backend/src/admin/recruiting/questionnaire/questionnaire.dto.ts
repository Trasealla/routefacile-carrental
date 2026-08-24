import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsIn,
    IsInt,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator';
import { BasicStatusTypes } from 'src/entities/enums/basic.status.type';

/**
 * Supported question types — keep in sync with frontend renderer.
 */
export const QUESTION_TYPES = [
    'text',
    'textarea',
    'yes_no',
    'single_choice',
    'multiple_choice',
    'number',
    'rating',
    'date',
    'email',
    'phone',
    'url',
    'file_upload',
] as const;

export type QuestionType = typeof QUESTION_TYPES[number];

/** Choice option for single_choice / multiple_choice questions. */
export class QuestionOptionDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    value!: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    label_en!: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    label_ar?: string;
}

/** Base shape — used by single create + bulk create items. */
export class RecruitingQuestionnaireBaseDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    question_en!: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    question_ar?: string;

    @IsOptional()
    @IsString()
    @IsIn(QUESTION_TYPES as any)
    question_type?: QuestionType;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => QuestionOptionDto)
    options?: QuestionOptionDto[];

    @IsOptional()
    @IsString()
    @MaxLength(500)
    help_text_en?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    help_text_ar?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    placeholder_en?: string;

    @IsOptional()
    @IsString()
    @MaxLength(255)
    placeholder_ar?: string;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    min_value?: number;

    @IsOptional()
    @IsInt()
    @Type(() => Number)
    max_value?: number;

    @IsOptional()
    @IsString()
    @MaxLength(60)
    category?: string;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    is_required?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    display_order?: number;

    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    @IsEnum(BasicStatusTypes)
    status?: number;
}

export class RecruitingQuestionnaireDto extends RecruitingQuestionnaireBaseDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    career_job_id!: number;

    created_by!: number;
    updated_by!: number;
}

export class RecruitingQuestionnaireUpdateDto extends RecruitingQuestionnaireBaseDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id?: number;

    updated_by!: number;
}

export class RecruitingQuestionnaireFilterDto {
    @IsOptional()
    @IsNumber()
    @Type(() => Number)
    career_job_id?: number;

    @IsOptional()
    @IsString()
    category?: string;

    @IsOptional()
    @IsString()
    @IsIn(QUESTION_TYPES as any)
    question_type?: QuestionType;

    @IsOptional()
    @IsString()
    search?: string;
}

/* ---------------------------- BULK OPERATIONS ---------------------------- */

export class RecruitingQuestionnaireBulkDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    career_job_id!: number;

    /** When true, soft-delete existing questions for this job before inserting. */
    @IsOptional()
    replace_existing?: boolean;

    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(100)
    @ValidateNested({ each: true })
    @Type(() => RecruitingQuestionnaireBaseDto)
    questions!: RecruitingQuestionnaireBaseDto[];
}

export class ReorderItemDto {
    @IsInt()
    @Type(() => Number)
    id!: number;

    @IsInt()
    @Min(1)
    @Type(() => Number)
    display_order!: number;
}

export class RecruitingQuestionnaireReorderDto {
    @IsArray()
    @ArrayMinSize(1)
    @ArrayMaxSize(200)
    @ValidateNested({ each: true })
    @Type(() => ReorderItemDto)
    items!: ReorderItemDto[];
}

export class RecruitingQuestionnaireDuplicateDto {
    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    source_career_job_id!: number;

    @IsNumber()
    @Type(() => Number)
    @IsNotEmpty()
    target_career_job_id!: number;

    /** When true, soft-delete existing questions on the target job first. Defaults to false (append). */
    @IsOptional()
    replace_existing?: boolean;
}
