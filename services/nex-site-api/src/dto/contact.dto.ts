import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';

export class CreateContactDto {
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @IsString()
    @IsNotEmpty()
    lastName: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsString()
    company?: string;

    @IsString()
    @IsNotEmpty()
    subject: string;

    @IsOptional()
    @IsString()
    service?: string;

    @IsString()
    @IsNotEmpty()
    message: string;
}

export class UpdateContactStatusDto {
    @IsString()
    @IsNotEmpty()
    status: 'new' | 'read' | 'replied' | 'archived';
}
