import { Controller, Get, Put, Body } from '@nestjs/common';
import { SiteSettingsService } from './site-settings.service';

@Controller('api/site-settings')
export class SiteSettingsController {
    constructor(private readonly service: SiteSettingsService) {}

    /** GET /api/site-settings — get all settings with metadata */
    @Get()
    async getAll() {
        return this.service.getAllWithMeta();
    }

    /** GET /api/site-settings/map — get as flat key-value map */
    @Get('map')
    async getMap() {
        return this.service.getAll();
    }

    /** PUT /api/site-settings — bulk update */
    @Put()
    async bulkUpdate(@Body() body: { settings: Record<string, string> }) {
        return this.service.bulkUpdate(body.settings);
    }
}
