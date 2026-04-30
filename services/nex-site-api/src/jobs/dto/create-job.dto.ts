import { IsString, IsEnum, IsOptional, IsArray, IsDateString } from 'class-validator';

export class CreateJobDto {
    @IsString()
    title: string;

    @IsString()
    department: string;

    @IsString()
    location: string;

    @IsString()
    type: string;

    @IsOptional()
    @IsString()
    salary?: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsArray()
    responsibilities?: string[];

    @IsOptional()
    @IsArray()
    qualifications?: string[];

    @IsOptional()
    @IsArray()
    benefits?: string[];

    @IsOptional()
    @IsArray()
    tags?: string[];

    @IsOptional()
    @IsEnum(['open', 'closed', 'draft'])
    status?: 'open' | 'closed' | 'draft';

    @IsOptional()
    @IsDateString()
    closingDate?: string;
}
