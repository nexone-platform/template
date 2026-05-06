import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TemplateCheckbox } from '../entities/template-checkbox.entity';

@Injectable()
export class TemplateCheckboxService {
  constructor(
    @InjectRepository(TemplateCheckbox)
    private repo: Repository<TemplateCheckbox>,
  ) {}

  async findAll() {
    const data = await this.repo.find();
    return data.map(item => this.mapToDto(item));
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('TemplateCheckbox order not found');
    return this.mapToDto(item);
  }

  async create(dto: any) {
    const newItem = this.repo.create({
      id: dto.id,
      customer_name: dto.customerName,
      origin: dto.origin,
      destination: dto.destination,
      cargo_type: dto.cargoType,
      weight: dto.weight,
      status: dto.status,
      priority: dto.priority,
      delivery_date: dto.deliveryDate,
      estimated_cost: dto.estimatedCost,
      vehicle_id: dto.vehicleId,
      driver_id: dto.driverId,
      create_by: dto.createBy || 'system'
    });
    const saved = await this.repo.save(newItem);
    return this.mapToDto(saved);
  }

  async update(id: string, dto: any) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('TemplateCheckbox order not found');

    if (dto.customerName !== undefined) item.customer_name = dto.customerName;
    if (dto.origin !== undefined) item.origin = dto.origin;
    if (dto.destination !== undefined) item.destination = dto.destination;
    if (dto.cargoType !== undefined) item.cargo_type = dto.cargoType;
    if (dto.weight !== undefined) item.weight = dto.weight;
    if (dto.status !== undefined) item.status = dto.status;
    if (dto.priority !== undefined) item.priority = dto.priority;
    if (dto.deliveryDate !== undefined) item.delivery_date = dto.deliveryDate;
    if (dto.estimatedCost !== undefined) item.estimated_cost = dto.estimatedCost;
    if (dto.vehicleId !== undefined) item.vehicle_id = dto.vehicleId;
    if (dto.driverId !== undefined) item.driver_id = dto.driverId;
    if (dto.updateBy !== undefined) item.update_by = dto.updateBy;

    const saved = await this.repo.save(item);
    return this.mapToDto(saved);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('TemplateCheckbox order not found');
    await this.repo.remove(item);
    return { success: true };
  }

  private mapToDto(item: TemplateCheckbox) {
    return {
      id: item.id,
      customerName: item.customer_name,
      origin: item.origin,
      destination: item.destination,
      cargoType: item.cargo_type,
      weight: Number(item.weight),
      status: item.status,
      priority: item.priority,
      deliveryDate: item.delivery_date,
      estimatedCost: Number(item.estimated_cost),
      vehicleId: item.vehicle_id,
      driverId: item.driver_id,
      createdAt: item.create_date,
      updatedAt: item.update_date
    };
  }
}
