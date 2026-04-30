import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Province } from '../../entities/province.entity';

@Injectable()
export class ProvincesService {
    constructor(
        @InjectRepository(Province)
        private provinceRepository: Repository<Province>,
    ) {}

    findAll() {
        return this.provinceRepository.find({ order: { province_id: 'ASC' } });
    }

    findOne(id: number) {
        return this.provinceRepository.findOne({ where: { province_id: id } });
    }

    async create(data: Partial<Province>) {
        const entity = this.provinceRepository.create(data);
        return this.provinceRepository.save(entity);
    }

    async update(id: number, data: Partial<Province>) {
        const entity = await this.findOne(id);
        if (!entity) throw new NotFoundException('Province not found');
        await this.provinceRepository.update({ province_id: id }, data);
        return this.findOne(id);
    }

    async remove(id: number) {
        const entity = await this.findOne(id);
        if (!entity) throw new NotFoundException('Province not found');
        return this.provinceRepository.remove(entity);
    }
}
