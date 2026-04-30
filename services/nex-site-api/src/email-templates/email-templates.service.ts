import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailTemplate } from '../entities/email-template.entity';

@Injectable()
export class EmailTemplatesService {
    constructor(
        @InjectRepository(EmailTemplate)
        private readonly repository: Repository<EmailTemplate>,
    ) {}

    async findAll(): Promise<EmailTemplate[]> {
        return this.repository.find({ order: { template_id: 'ASC' } });
    }

    async findOne(id: number): Promise<EmailTemplate> {
        const item = await this.repository.findOne({ where: { template_id: id } });
        if (!item) {
            throw new NotFoundException(`Email template with ID ${id} not found`);
        }
        return item;
    }

    async create(data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const entity = this.repository.create(data);
        return this.repository.save(entity);
    }

    async update(id: number, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
        const item = await this.findOne(id);
        const updated = Object.assign(item, data);
        updated.update_date = new Date();
        return this.repository.save(updated);
    }

    async remove(id: number): Promise<void> {
        const item = await this.findOne(id);
        await this.repository.remove(item);
    }
}
