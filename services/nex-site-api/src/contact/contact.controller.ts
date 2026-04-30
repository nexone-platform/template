import { Controller, Post, Get, Put, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto, UpdateContactStatusDto } from '../dto/contact.dto';
import { Request } from 'express';

@Controller('api/contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    // POST /api/contact — ส่งแบบฟอร์มติดต่อ (frontend)
    @Post()
    async create(
        @Body() body: CreateContactDto,
        @Req() req: Request,
    ) {
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        return this.contactService.create({
            ...body,
            ipAddress,
            userAgent,
        });
    }

    // GET /api/contact — ดูรายการทั้งหมด (backoffice)
    @Get()
    async findAll(@Query('limit') limit?: string) {
        const take = limit ? parseInt(limit, 10) : 100;
        return this.contactService.findAll(take);
    }

    // GET /api/contact/stats — สถิติ
    @Get('stats')
    async getStats() {
        return this.contactService.getStats();
    }

    // GET /api/contact/:id — ดูรายละเอียด
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const submission = await this.contactService.findOne(id);
        if (!submission) {
            return { success: false, message: 'ไม่พบข้อมูล' };
        }
        return submission;
    }

    // PUT /api/contact/:id/status — อัปเดตสถานะ
    @Put(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateContactStatusDto,
    ) {
        return this.contactService.updateStatus(id, body.status);
    }

    // DELETE /api/contact/:id — ลบ
    @Delete(':id')
    async delete(@Param('id') id: string) {
        return this.contactService.delete(id);
    }
}
