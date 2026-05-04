// @ts-nocheck
import { Injectable, NotFoundException, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../entities/menu.entity';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async findAll(appName?: string, includeInactive: boolean = false): Promise<any> {
    try {
      const menusQuery = `
        SELECT menu_id, menu_seq, parent_id, menu_type, menu_code, title, route, page_key, icon, app_name, is_active
        FROM nex_core.menus
        WHERE 1=1
        ${!includeInactive ? 'AND is_active = true' : ''}
        ${appName ? 'AND app_name = $1' : ''}
        ORDER BY menu_seq ASC, menu_id ASC
      `;
      const menusParams = appName ? [appName] : [];
      const menus = await this.menuRepository.query(menusQuery, menusParams);

      const transQuery = `
        SELECT label_key, language_code, label_value 
        FROM nex_core.language_translations 
        WHERE page_key = 'app_menus' OR page_key = 'menu'
      `;
      const translations = await this.menuRepository.query(transQuery);

      const transMap: Record<string, Record<string, string>> = {};
      for (const t of translations) {
        if (!transMap[t.label_key]) transMap[t.label_key] = {};
        transMap[t.label_key][t.language_code] = t.label_value;
      }

      // Map output to explicitly exclude internal DB fields (create_date, create_by, etc.)
      return menus.map((m: any) => ({
        menu_id: m.menu_id,
        menu_seq: m.menu_seq,
        parent_id: m.parent_id,
        menu_type: m.menu_type,
        menu_code: m.menu_code,
        title: m.title,
        route: m.route,
        page_key: m.page_key,
        icon: m.icon,
        app_name: m.app_name,
        is_active: m.is_active,
        translations: transMap[m.page_key] || transMap[m.menu_code] || {}
      }));
    } catch (err) {
      console.error('FIND ALL ERROR:', err);
      return { error: 'Failed to retrieve menus. Please try again later.' };
    }
  }

  async findOne(id: string | number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { menu_id: String(id) as any } });
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async create(createMenuDto: any): Promise<Menu> {
    try {
      const translations = createMenuDto.translations || {};
      const cleanDto = { ...createMenuDto };
      delete cleanDto.translations;

      const menu = new Menu();
      Object.assign(menu, cleanDto);
      menu.parent_id = ((!menu.parent_id || menu.parent_id === 'null') ? null : menu.parent_id) as any;
      if (menu.menu_seq == null) {
          menu.menu_seq = 999;
      }
      menu.create_by = null as any;
      menu.create_date = new Date();
      const savedMenu = await this.menuRepository.save(menu);

      if (savedMenu.page_key && Object.keys(translations).length > 0) {
        for (const [lang, value] of Object.entries(translations)) {
          if (value) {
            await this.menuRepository.query(
              `INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value) VALUES (gen_random_uuid(), $1, 'app_menus', $2, $3)`,
              [lang, savedMenu.page_key, value]
            );
          }
        }
      }
      return savedMenu;
    } catch (e) {
      throw new HttpException(e.message || String(e), 400);
    }
  }

  async update(id: string | number, updateMenuDto: any): Promise<Menu> {
    try {
      const menu = await this.findOne(id);
      const oldPageKey = menu.page_key;
      
      const translations = updateMenuDto.translations || {};
      
      // Clean up relations or non-column fields that might crash TypeORM
      const cleanDto = { ...updateMenuDto };
      delete cleanDto.translations;
      delete cleanDto.children;
      delete cleanDto.menu_id;
      delete cleanDto.create_date;
      delete cleanDto.update_date;
      
      Object.assign(menu, cleanDto);
      menu.parent_id = ((!menu.parent_id || menu.parent_id === 'null') ? null : menu.parent_id) as any;
      if (menu.menu_seq == null) {
          menu.menu_seq = 999;
      }
      menu.create_by = ((!menu.create_by || menu.create_by === 'null') ? null : menu.create_by) as any;
      menu.update_by = null as any;
      menu.update_date = new Date();
      const savedMenu = await this.menuRepository.save(menu);

      const finalPageKey = savedMenu.page_key;
      
      if (oldPageKey) {
          await this.menuRepository.query(`DELETE FROM nex_core.language_translations WHERE page_key IN ('app_menus', 'menu') AND label_key = $1`, [oldPageKey]);
      }
      if (finalPageKey && finalPageKey !== oldPageKey) {
          await this.menuRepository.query(`DELETE FROM nex_core.language_translations WHERE page_key IN ('app_menus', 'menu') AND label_key = $1`, [finalPageKey]);
      }
      
      if (finalPageKey) {
          for (const [lang, value] of Object.entries(translations)) {
              if (value) {
                  await this.menuRepository.query(
                      `INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value) VALUES (gen_random_uuid(), $1, 'app_menus', $2, $3)`,
                      [lang, finalPageKey, value]
                  );
              }
          }
      }
      return savedMenu;
    } catch (e) {
      throw new HttpException(e.message || String(e), 400);
    }
  }

  async remove(id: string | number): Promise<void> {
    const menu = await this.findOne(id);
    if (menu.page_key) {
        await this.menuRepository.query(`DELETE FROM nex_core.language_translations WHERE page_key IN ('app_menus', 'menu') AND label_key = $1`, [menu.page_key]);
    }
    await this.menuRepository.remove(menu);
  }

  async toggleStatus(id: string | number, isActive: boolean): Promise<Menu> {
    try {
      const menu = await this.findOne(id);
      menu.is_active = isActive;
      menu.parent_id = ((!menu.parent_id || menu.parent_id === 'null') ? null : menu.parent_id) as any;
      menu.create_by = (!menu.create_by || menu.create_by === 'null') ? null : menu.create_by;
      menu.update_by = null;
      menu.update_date = new Date();
      return await this.menuRepository.save(menu);
    } catch (e) {
      throw new HttpException(e.message || String(e), 400);
    }
  }
}
