import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async findAll(appName?: string): Promise<any> {
    try {
      const where: any = {};
      if (appName) where.app_name = appName;
      return await this.menuRepository.find({
        where,
        order: { menu_seq: 'ASC', menu_id: 'ASC' }
      });
    } catch (err) {
      console.error('FIND ALL ERROR:', err);
      return { error: err.message };
    }
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { menu_id: id } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async create(createMenuDto: any): Promise<Menu> {
    const menu = new Menu();
    Object.assign(menu, createMenuDto);
    menu.create_by = 'system';
    menu.create_date = new Date();
    return this.menuRepository.save(menu);
  }

  async update(id: number, updateMenuDto: any): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    menu.update_by = 'system';
    menu.update_date = new Date();
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }

  async toggleStatus(id: number, isActive: boolean): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.is_active = isActive;
    menu.update_by = 'system';
    menu.update_date = new Date();
    return this.menuRepository.save(menu);
  }
}
