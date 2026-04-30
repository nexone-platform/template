import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from '../entities/job.entity';
import { CreateJobDto } from './dto/create-job.dto';

@Injectable()
export class JobsService {
    constructor(
        @InjectRepository(Job)
        private readonly jobsRepo: Repository<Job>,
    ) { }

    async findAll(status?: string): Promise<Job[]> {
        if (status) {
            return this.jobsRepo.find({
                where: { status: status as any },
                order: { createdAt: 'DESC' },
            });
        }
        return this.jobsRepo.find({ order: { createdAt: 'DESC' } });
    }

    async findOne(id: string): Promise<Job> {
        const job = await this.jobsRepo.findOne({ where: { id } });
        if (!job) throw new NotFoundException(`Job ${id} not found`);
        // Increment views
        await this.jobsRepo.update(id, { views: job.views + 1 });
        return { ...job, views: job.views + 1 };
    }

    async create(dto: CreateJobDto): Promise<Job> {
        const job = this.jobsRepo.create(dto);
        return this.jobsRepo.save(job);
    }

    async update(id: string, dto: Partial<CreateJobDto>): Promise<Job> {
        await this.findOne(id);
        await this.jobsRepo.update(id, dto as any);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);
        await this.jobsRepo.delete(id);
    }

    async setStatus(id: string, status: 'open' | 'closed' | 'draft'): Promise<Job> {
        await this.findOne(id);
        await this.jobsRepo.update(id, { status });
        return this.findOne(id);
    }
}
