import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from '../entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private readonly announcementRepository: Repository<Announcement>,
  ) {}

  async findAll(): Promise<Announcement[]> {
    return this.announcementRepository.find({
      order: { createDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Announcement> {
    const announcement = await this.announcementRepository.findOne({ where: { id } });
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    return announcement;
  }

  async create(createData: Partial<Announcement>): Promise<Announcement> {
    const newAnnouncement = this.announcementRepository.create(createData);
    return this.announcementRepository.save(newAnnouncement);
  }

  async update(id: string, updateData: Partial<Announcement>): Promise<Announcement> {
    const announcement = await this.findOne(id);
    const updatedAnnouncement = Object.assign(announcement, updateData);
    return this.announcementRepository.save(updatedAnnouncement);
  }

  async remove(id: string): Promise<void> {
    const announcement = await this.findOne(id);
    await this.announcementRepository.remove(announcement);
  }
}
