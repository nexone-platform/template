import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Job } from '../entities/job.entity';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ExternalJobsService } from './external-jobs.service';
import { ResumeService } from './resume.service';

@Module({
    imports: [TypeOrmModule.forFeature([Job])],
    controllers: [JobsController],
    providers: [JobsService, ExternalJobsService, ResumeService],
    exports: [JobsService, ExternalJobsService, ResumeService],
})
export class JobsModule { }
