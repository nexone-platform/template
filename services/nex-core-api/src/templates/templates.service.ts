import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Template } from '../entities/template.entity';

@Injectable()
export class TemplatesService {
  constructor(
    @InjectRepository(Template)
    private readonly templateRepository: Repository<Template>,
  ) {}

  async findAll(): Promise<Template[]> {
    return this.templateRepository.find({
      order: { template_id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Template> {
    const item = await this.templateRepository.findOne({ where: { template_id: id } });
    if (!item) throw new NotFoundException(`Template #${id} not found`);
    return item;
  }

  async create(dto: Partial<Template>): Promise<Template> {
    const item = this.templateRepository.create({
      ...dto,
      create_by: 'system',
      create_date: new Date(),
    });
    return this.templateRepository.save(item);
  }

  async update(id: number, dto: Partial<Template>): Promise<Template> {
    const item = await this.findOne(id);
    Object.assign(item, dto, { update_date: new Date() });
    return this.templateRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.templateRepository.remove(item);
  }

  async toggleStatus(id: number, is_active: boolean): Promise<Template> {
    const item = await this.findOne(id);
    item.is_active = is_active;
    item.update_date = new Date();
    return this.templateRepository.save(item);
  }
}
