import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { Announcement } from '../entities/announcement.entity';

@Controller('v1/announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  async findAll(): Promise<Announcement[]> {
    return this.announcementsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Announcement> {
    return this.announcementsService.findOne(id);
  }

  @Post()
  async create(@Body() createData: Partial<Announcement>): Promise<Announcement> {
    return this.announcementsService.create(createData);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<Announcement>): Promise<Announcement> {
    return this.announcementsService.update(id, updateData);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.announcementsService.remove(id);
  }
}
