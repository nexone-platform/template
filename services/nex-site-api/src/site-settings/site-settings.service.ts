import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteSetting } from '../entities/site-setting.entity';

/** Default settings seeded on first run */
const DEFAULT_SETTINGS: Array<{ key: string; value: string; description: string }> = [
    { key: 'contact_notification_email', value: '', description: 'อีเมลที่จะรับแจ้งเตือนเมื่อมีคนกรอกฟอร์มติดต่อเรา (คั่นด้วยเครื่องหมายจุลภาค หากมีหลายอีเมล)' },
    { key: 'smtp_host', value: '', description: 'SMTP Server Host (เช่น smtp.gmail.com)' },
    { key: 'smtp_port', value: '587', description: 'SMTP Port (587 สำหรับ TLS, 465 สำหรับ SSL)' },
    { key: 'smtp_user', value: '', description: 'SMTP Username / Email' },
    { key: 'smtp_password', value: '', description: 'SMTP Password / App Password' },
    { key: 'smtp_from_name', value: 'TechBiz Convergence', description: 'ชื่อผู้ส่ง' },
    { key: 'smtp_from_email', value: '', description: 'อีเมลผู้ส่ง' },
    { key: 'email_enabled', value: 'false', description: 'เปิด/ปิด การส่งอีเมลแจ้งเตือน' },
];

@Injectable()
export class SiteSettingsService implements OnModuleInit {
    constructor(
        @InjectRepository(SiteSetting)
        private readonly repo: Repository<SiteSetting>,
    ) {}

    /** Seed defaults on first startup */
    async onModuleInit() {
        for (const def of DEFAULT_SETTINGS) {
            const existing = await this.repo.findOne({ where: { key: def.key } });
            if (!existing) {
                await this.repo.save(this.repo.create(def));
            }
        }
    }

    /** Get all settings as key-value map */
    async getAll(): Promise<Record<string, string>> {
        const items = await this.repo.find({ order: { key: 'ASC' } });
        const map: Record<string, string> = {};
        items.forEach(item => {
            map[item.key] = item.value;
        });
        return map;
    }

    /** Get all settings with metadata */
    async getAllWithMeta(): Promise<SiteSetting[]> {
        return this.repo.find({ order: { key: 'ASC' } });
    }

    /** Get single setting value */
    async get(key: string): Promise<string> {
        const item = await this.repo.findOne({ where: { key } });
        return item?.value || '';
    }

    /** Set single setting */
    async set(key: string, value: string): Promise<SiteSetting> {
        let item = await this.repo.findOne({ where: { key } });
        if (item) {
            item.value = value;
        } else {
            item = this.repo.create({ key, value });
        }
        return this.repo.save(item);
    }

    /** Bulk update settings */
    async bulkUpdate(updates: Record<string, string>): Promise<{ success: boolean; updated: number }> {
        let count = 0;
        for (const [key, value] of Object.entries(updates)) {
            await this.set(key, value);
            count++;
        }
        return { success: true, updated: count };
    }
}
