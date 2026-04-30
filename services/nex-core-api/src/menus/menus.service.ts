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
      const menusQuery = `
        SELECT menus_id, menu_seq, parent_id, menu_code, menu_value, title, route, base, page_key, icon, app_name
        FROM nex_core.menus
        WHERE is_active = true
        ${appName ? 'AND app_name = $1' : ''}
        ORDER BY menu_seq ASC, menus_id ASC
      `;
      const menusParams = appName ? [appName] : [];
      const menus = await this.menuRepository.query(menusQuery, menusParams);

      const transQuery = `
        SELECT label_key, language_code, label_value 
        FROM nex_core.language_translations 
        WHERE page_key = 'menu'
      `;
      const translations = await this.menuRepository.query(transQuery);

      const transMap: Record<string, Record<string, string>> = {};
      for (const t of translations) {
        if (!transMap[t.label_key]) transMap[t.label_key] = {};
        transMap[t.label_key][t.language_code] = t.label_value;
      }

      // Map output to explicitly exclude internal DB fields (create_date, create_by, etc.)
      return menus.map((m: any) => ({
        menus_id: m.menus_id,
        menu_seq: m.menu_seq,
        parent_id: m.parent_id,
        menu_code: m.menu_code,
        menu_value: m.menu_value,
        title: m.title,
        route: m.route,
        base: m.base,
        page_key: m.page_key,
        icon: m.icon,
        app_name: m.app_name,
        translations: transMap[m.menu_code] || {}
      }));
    } catch (err) {
      console.error('FIND ALL ERROR:', err);
      return { error: err.message };
    }
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { menus_id: id } });
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
