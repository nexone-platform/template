import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateMasterGraph } from '../../entities/template-master-graph.entity';

@Injectable()
export class TemplateMasterGraphService {
  constructor(
    @InjectRepository(TemplateMasterGraph)
    private readonly repo: Repository<TemplateMasterGraph>,
  ) {}

  async findAll(): Promise<TemplateMasterGraph[]> {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  async findOne(id: number): Promise<TemplateMasterGraph> {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException(`Record with ID ${id} not found`);
    return item;
  }

  async create(dto: Partial<TemplateMasterGraph>): Promise<TemplateMasterGraph> {
    const item = this.repo.create({
      ...dto,
      isActive: dto.isActive ?? true,
      createBy: 'system',
    });
    return this.repo.save(item);
  }

  async update(id: number, dto: Partial<TemplateMasterGraph>): Promise<TemplateMasterGraph> {
    const item = await this.findOne(id);
    Object.assign(item, dto);
    item.updateBy = 'system';
    return this.repo.save(item);
  }

  async remove(id: number): Promise<void> {
    const item = await this.findOne(id);
    await this.repo.remove(item);
  }

  async toggleStatus(id: number, isActive: boolean): Promise<TemplateMasterGraph> {
    return this.update(id, { isActive });
  }

  async getSummary(): Promise<{ paid: number; pending: number; overdue: number; total: number }> {
    const all = await this.repo.find();
    return {
      total: all.length,
      paid: all.filter(r => r.status === 'ชำระแล้ว').length,
      pending: all.filter(r => r.status === 'รอชำระ').length,
      overdue: all.filter(r => r.status === 'เกินกำหนด').length,
    };
  }
}
