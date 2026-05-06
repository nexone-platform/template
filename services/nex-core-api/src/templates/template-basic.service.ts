import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateBasic } from '../entities/template-basic.entity';

@Injectable()
export class TemplateBasicService {
  constructor(
    @InjectRepository(TemplateBasic)
    private readonly templateRepository: Repository<TemplateBasic>,
  ) {}

  async findAll(): Promise<TemplateBasic[]> {
    return this.templateRepository.find({
      order: { template_id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<TemplateBasic> {
    const item = await this.templateRepository.findOne({ where: { template_id: id } });
    if (!item) throw new NotFoundException(`TemplateBasic #${id} not found`);
    return item;
  }

  async create(dto: Partial<TemplateBasic>): Promise<TemplateBasic> {
    const item = this.templateRepository.create({
      ...dto,
      create_by: 'system',
      create_date: new Date(),
    });
    return this.templateRepository.save(item);
  }

  async update(id: number, dto: Partial<TemplateBasic>): Promise<TemplateBasic> {
    const item = await this.findOne(id);
    Object.assign(item, dto, { update_date: new Date() });
    return this.templateRepository.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.templateRepository.remove(item);
  }

  async toggleStatus(id: number, is_active: boolean): Promise<TemplateBasic> {
    const item = await this.findOne(id);
    item.is_active = is_active;
    item.update_date = new Date();
    return this.templateRepository.save(item);
  }
}
