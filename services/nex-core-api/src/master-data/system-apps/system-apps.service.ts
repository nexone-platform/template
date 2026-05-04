import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemApp } from './entities/system-app.entity';

@Injectable()
export class SystemAppsService {
  constructor(
    @InjectRepository(SystemApp)
    private readonly repo: Repository<SystemApp>,
  ) {}

  async findAll(showAll?: string) {
    try {
      let apps;
      if (showAll === 'true') {
        apps = await this.repo.find({ order: { seq_no: 'ASC', id: 'ASC' } });
      } else {
        apps = await this.repo.find({ where: { is_active: true }, order: { seq_no: 'ASC', id: 'ASC' } });
      }

      // Fetch translations dynamically
      const transQuery = `
        SELECT label_key, language_code, label_value 
        FROM nex_core.language_translations 
        WHERE page_key = 'system-app' OR page_key = 'system_apps'
      `;
      const translations = await this.repo.query(transQuery);

      const transMap: Record<string, Record<string, string>> = {};
      for (const t of translations) {
        if (!transMap[t.label_key]) transMap[t.label_key] = {};
        transMap[t.label_key][t.language_code] = t.label_value;
      }

      return apps.map((app) => ({
        ...app,
        translations: transMap[app.app_name] || {}
      }));
    } catch (e: any) {
      return { error_debug: e.message, stack: e.stack };
    }
  }

  async create(createAppDto: any) {
    if (createAppDto.status === 'active') createAppDto.is_active = true;
    if (createAppDto.status === 'inactive') createAppDto.is_active = false;
    
    const translations = createAppDto.translations || {};
    delete createAppDto.status;
    delete createAppDto.translations;
    delete createAppDto.app_url;

    const newApp = this.repo.create(createAppDto);
    const savedApp = (await this.repo.save(newApp)) as any;

    if (savedApp && savedApp.app_name && Object.keys(translations).length > 0) {
      for (const [lang, value] of Object.entries(translations)) {
        if (value) {
            await this.repo.query(
                `INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value) VALUES (gen_random_uuid(), $1, 'system_apps', $2, $3)`,
                [lang, savedApp.app_name, value]
            );
        }
      }
    }
    return savedApp;
  }

  async update(id: number, updateAppDto: any) {
    try {
      if (updateAppDto.status === 'active') updateAppDto.is_active = true;
      if (updateAppDto.status === 'inactive') updateAppDto.is_active = false;
      
      const translations = updateAppDto.translations || {};
      const appName = updateAppDto.app_name; 
      
      let currentApp = await this.repo.findOneBy({ id });
      const finalAppName = appName || currentApp?.app_name;
      
      delete updateAppDto.status;
      delete updateAppDto.translations;
      delete updateAppDto.app_url;
      delete updateAppDto.desc_en;
      delete updateAppDto.desc_th;
      delete updateAppDto.id;
      delete updateAppDto.app_id;
      delete updateAppDto.created_at;

      await this.repo.update(id, updateAppDto);
      
      if (finalAppName) {
          // Delete all existing translations for this app
          await this.repo.query(`DELETE FROM nex_core.language_translations WHERE page_key = 'system_apps' AND label_key = $1`, [finalAppName]);
          await this.repo.query(`DELETE FROM nex_core.language_translations WHERE page_key = 'system-app' AND label_key = $1`, [finalAppName]);
          
          // Insert new translations
          for (const [lang, value] of Object.entries(translations)) {
              if (value) {
                  await this.repo.query(
                      `INSERT INTO nex_core.language_translations (translation_id, language_code, page_key, label_key, label_value) VALUES (gen_random_uuid(), $1, 'system_apps', $2, $3)`,
                      [lang, finalAppName, value]
                  );
              }
          }
      }
      return this.repo.findOneBy({ id });
    } catch(e: any) {
      console.error(e);
      return { error_debug: e.message, stack: e.stack };
    }
  }

  async remove(id: number) {
    const app = await this.repo.findOneBy({ id });
    if (app) {
        await this.repo.query(`DELETE FROM nex_core.language_translations WHERE page_key = 'system-app' AND label_key = $1`, [app.app_name]);
        await this.repo.delete(id);
    }
    return { id };
  }
}
