import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemApp } from '../entities/system-app.entity';

@Injectable()
export class SystemAppService {
    constructor(
        @InjectRepository(SystemApp)
        private readonly systemAppRepo: Repository<SystemApp>,
    ) {}

    async findAll(): Promise<SystemApp[]> {
        return this.systemAppRepo.find({
            order: { seq_no: 'ASC', app_name: 'ASC' }
        });
    }

    async findOne(id: number): Promise<SystemApp | null> {
        return this.systemAppRepo.findOne({ where: { id } });
    }

    async update(id: number, updateData: Partial<SystemApp>): Promise<SystemApp | null> {
        await this.systemAppRepo.update(id, updateData);
        return this.findOne(id);
    }
}
