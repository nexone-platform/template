import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../entities/company.entity';

@Controller('api/v1/company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Get()
    async getCompany(): Promise<{ data: Company | null }> {
        const com = await this.companyService.getFirstCompany();
        return { data: com || null };
    }

    @Post()
    async saveCompany(@Body() data: Partial<Company>): Promise<{ data: Company }> {
        const com = await this.companyService.saveFirstCompany(data);
        return { data: com };
    }
}
