import { IsString, IsNotEmpty, IsOptional, IsEnum, IsBoolean, MinLength, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @IsNotEmpty()
    username: string;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsNotEmpty()
    displayName: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsEnum(['admin', 'editor'])
    role?: 'admin' | 'editor';

    @IsOptional()
    @IsArray()
    allowedPages?: string[];
}

export class UpdateUserDto {
    @IsOptional()
    @IsString()
    displayName?: string;

    @IsOptional()
    @IsString()
    email?: string;

    @IsOptional()
    @IsEnum(['admin', 'editor'])
    role?: 'admin' | 'editor';

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsString()
    @MinLength(6)
    password?: string;

    @IsOptional()
    @IsArray()
    allowedPages?: string[];
}
