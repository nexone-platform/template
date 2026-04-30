import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
    ) {}

    async getFirstCompany(): Promise<Company> {
        return this.companyRepo.createQueryBuilder('com')
            .orderBy('com.createdAt', 'ASC')
            .getOne();
    }

    async saveFirstCompany(data: Partial<Company>): Promise<Company> {
        let company = await this.getFirstCompany();
        if (company) {
            await this.companyRepo.update(company.id, data);
            return this.getFirstCompany();
        } else {
            company = this.companyRepo.create(data);
            return this.companyRepo.save(company);
        }
    }
}
