import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { EmailTemplatesService } from './email-templates.service';
import { EmailTemplate } from '../entities/email-template.entity';

@Controller('api/email-templates')
export class EmailTemplatesController {
    constructor(private readonly emailTemplatesService: EmailTemplatesService) {}

    @Get()
    async findAll() {
        const data = await this.emailTemplatesService.findAll();
        // Return wrapped in standard API response
        return { data, total: data.length };
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        const data = await this.emailTemplatesService.findOne(+id);
        return { data };
    }

    @Post()
    async create(@Body() createDto: Partial<EmailTemplate>) {
        const data = await this.emailTemplatesService.create(createDto);
        return { data, message: 'Email Template created successfully' };
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() updateDto: Partial<EmailTemplate>) {
        const data = await this.emailTemplatesService.update(+id, updateDto);
        return { data, message: 'Email Template updated successfully' };
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        await this.emailTemplatesService.remove(+id);
        return { message: 'Email Template deleted successfully' };
    }
}
