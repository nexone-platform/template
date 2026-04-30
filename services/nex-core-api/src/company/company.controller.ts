import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../entities/company.entity';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('v1/company')
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Get()
  @AuditLog('Company', 'Get Company')
  async getCompany(): Promise<{ data: Company | null }> {
        const com = await this.companyService.getFirstCompany();
        return { data: com || null };
    }

    @Post()
  @AuditLog('Company', 'Save Company')
  async saveCompany(@Body() data: Partial<Company>): Promise<{ data: Company }> {
        const com = await this.companyService.saveFirstCompany(data);
        return { data: com };
    }
}

