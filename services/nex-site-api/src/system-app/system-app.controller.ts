import { Controller, Get, Put, Body, Param, NotFoundException } from '@nestjs/common';
import { SystemAppService } from './system-app.service';
import { SystemApp } from '../entities/system-app.entity';

@Controller('api/v1/system-apps')
export class SystemAppController {
    constructor(private readonly systemAppService: SystemAppService) {}

    @Get()
    async findAll(): Promise<{ data: SystemApp[] }> {
        const apps = await this.systemAppService.findAll();
        return { data: apps };
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<{ data: SystemApp }> {
        const app = await this.systemAppService.findOne(id);
        if (!app) {
            throw new NotFoundException(`System app with ID ${id} not found`);
        }
        return { data: app };
    }

    @Put(':id')
    async update(
        @Param('id') id: number,
        @Body() updateData: Partial<SystemApp>,
    ): Promise<{ data: SystemApp }> {
        const updated = await this.systemAppService.update(id, updateData);
        if (!updated) {
            throw new NotFoundException(`System app with ID ${id} not found`);
        }
        return { data: updated };
    }
}
