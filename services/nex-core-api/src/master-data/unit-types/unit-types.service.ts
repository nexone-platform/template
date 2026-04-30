import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnitType } from '../../entities/unit-type.entity';

@Injectable()
export class UnitTypesService {
    constructor(
        @InjectRepository(UnitType)
        private unitTypeRepository: Repository<UnitType>,
    ) {}

    findAll() {
        return this.unitTypeRepository.find({ order: { id: 'ASC' } });
    }

    findOne(id: number) {
        return this.unitTypeRepository.findOne({ where: { id } });
    }

    async create(data: Partial<UnitType>) {
        const entity = this.unitTypeRepository.create(data);
        return this.unitTypeRepository.save(entity);
    }

    async update(id: number, data: Partial<UnitType>) {
        const entity = await this.findOne(id);
        if (!entity) throw new NotFoundException('Unit Type not found');
        await this.unitTypeRepository.update(id, data);
        return this.findOne(id);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (!entity) throw new NotFoundException('Unit Type not found');
        return this.unitTypeRepository.remove(entity);
    }
}
