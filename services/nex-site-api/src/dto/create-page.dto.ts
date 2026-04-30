import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray, IsBoolean } from 'class-validator';

export class CreatePageDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsOptional()
    @IsArray()
    layout?: any[];

    @IsOptional()
    @IsObject()
    seoMeta?: {
        title: string;
        description: string;
        keywords: string[];
    };

    @IsOptional()
    @IsEnum(['draft', 'published'])
    status?: 'draft' | 'published';

    @IsOptional()
    @IsBoolean()
    isNavVisible?: boolean;
}
