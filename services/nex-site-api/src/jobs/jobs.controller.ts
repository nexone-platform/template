import {
    Controller, Get, Post, Put, Patch, Delete,
    Param, Body, Query, HttpCode, HttpStatus,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { ExternalJobsService } from './external-jobs.service';
import { ResumeService, ResumeSubmission } from './resume.service';

@Controller('api/jobs')
export class JobsController {
    constructor(
        private readonly jobsService: JobsService,
        private readonly externalJobsService: ExternalJobsService,
        private readonly resumeService: ResumeService,
    ) { }

    // GET /api/jobs/external?status=Open  ← must be BEFORE :id
    @Get('external')
    findExternal(@Query('status') status?: string) {
        return this.externalJobsService.findAll(status);
    }

    // GET /api/jobs/external/:id
    @Get('external/:id')
    findExternalOne(@Param('id') id: string) {
        return this.externalJobsService.findOne(id);
    }

    // POST /api/jobs/apply — submit a job application / resume
    @Post('apply')
    async applyJob(@Body() body: ResumeSubmission) {
        return this.resumeService.submitResume(body);
    }

    // GET /api/jobs?status=open
    @Get()
    findAll(@Query('status') status?: string) {
        return this.jobsService.findAll(status);
    }

    // GET /api/jobs/:id
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.jobsService.findOne(id);
    }

    // POST /api/jobs
    @Post()
    create(@Body() dto: CreateJobDto) {
        return this.jobsService.create(dto);
    }

    // PUT /api/jobs/:id
    @Put(':id')
    update(@Param('id') id: string, @Body() dto: Partial<CreateJobDto>) {
        return this.jobsService.update(id, dto);
    }

    // PATCH /api/jobs/:id/status
    @Patch(':id/status')
    setStatus(
        @Param('id') id: string,
        @Body('status') status: 'open' | 'closed' | 'draft',
    ) {
        return this.jobsService.setStatus(id, status);
    }

    // DELETE /api/jobs/:id
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.jobsService.remove(id);
    }
}
