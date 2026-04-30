import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { TranslationsService } from './translations.service';

@Controller('api/translations')
export class TranslationsController {
    constructor(private readonly service: TranslationsService) {}

    // ════════════════════════════════════════
    // LANGUAGES
    // ════════════════════════════════════════

    // GET /api/translations/languages → all languages
    @Get('languages')
    async getLanguages() {
        return this.service.getLanguages();
    }

    // GET /api/translations/languages/active → only active
    @Get('languages/active')
    async getActiveLanguages() {
        return this.service.getActiveLanguages();
    }

    // POST /api/translations/languages → create language
    @Post('languages')
    async createLanguage(@Body() body: { languageCode: string; languageName: string; description?: string }) {
        try {
            const result = await this.service.createLanguage(body);
            return { success: true, data: result };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // PUT /api/translations/languages/:id → update language
    @Put('languages/:id')
    async updateLanguage(
        @Param('id') id: string,
        @Body() body: Partial<{ languageName: string; description: string; isActive: boolean }>,
    ) {
        try {
            const result = await this.service.updateLanguage(+id, body);
            return { success: true, data: result };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // DELETE /api/translations/languages/:id → delete language + its translations
    @Delete('languages/:id')
    async deleteLanguage(@Param('id') id: string) {
        return this.service.deleteLanguage(+id);
    }

    // ════════════════════════════════════════
    // TRANSLATIONS
    // ════════════════════════════════════════

    // GET /api/translations/map?lang=th → flat { key: text } for frontend
    @Get('map')
    async getMap(@Query('lang') lang?: string) {
        return this.service.getAllAsMap(lang || 'th');
    }

    // GET /api/translations/sections → list of page keys
    @Get('sections')
    async getSections() {
        return this.service.getPageKeys();
    }

    // GET /api/translations?section=nav → grouped list for backoffice
    @Get()
    async findAllGrouped(@Query('section') section?: string) {
        return this.service.findAllGrouped(section);
    }

    // POST /api/translations → create new key with values
    @Post()
    async createKey(@Body() body: { labelKey: string; pageKey: string; values: Record<string, string> }) {
        try {
            const result = await this.service.createKey(body);
            return { success: true, ...result };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // PUT /api/translations/bulk → bulk update
    @Put('bulk')
    async bulkUpdate(@Body() body: { items: Array<{ id: number; labelValue: string }> }) {
        return this.service.bulkUpdate(body.items);
    }

    // PUT /api/translations/:id → update single
    @Put(':id')
    async updateOne(
        @Param('id') id: string,
        @Body() body: { labelValue?: string, is_active?: boolean },
    ) {
        try {
            const result = await this.service.updateOne(+id, body);
            return { success: true, data: result };
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // DELETE /api/translations/key/:labelKey → delete all translations for a key
    @Delete('key/:labelKey')
    async deleteByKey(@Param('labelKey') labelKey: string) {
        return this.service.deleteByKey(labelKey);
    }

    // DELETE /api/translations/id/:id → delete translation by id
    @Delete('id/:id')
    async deleteById(@Param('id') id: string) {
        return this.service.deleteById(+id);
    }

    // POST /api/translations/generate-from-layout → auto-generate translation keys from page layout
    @Post('generate-from-layout')
    async generateFromLayout(@Body() body: { layout: any[]; pageSlug?: string }) {
        try {
            const result = await this.service.generateFromLayout(body.layout, body.pageSlug);
            return result;
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }

    // POST /api/translations/generate-bo-keys → auto-generate backoffice UI translation keys
    @Post('generate-bo-keys')
    async generateBoKeys(@Body() body?: { usedKeys?: Record<string, string> }) {
        try {
            const result = await this.service.generateBoKeys(body?.usedKeys);
            return result;
        } catch (e: any) {
            return { success: false, message: e.message };
        }
    }
}
