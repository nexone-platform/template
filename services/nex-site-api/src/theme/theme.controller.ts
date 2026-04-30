import { Controller, Get, Put, Post, Body } from '@nestjs/common';
import { ThemeService } from './theme.service';

@Controller('api/theme')
export class ThemeController {
    constructor(private readonly themeService: ThemeService) { }

    @Get()
    async getActive() {
        return this.themeService.getActive();
    }

    @Put()
    async update(@Body() updateData: any) {
        return this.themeService.update(updateData);
    }

    @Post('reset')
    async reset() {
        return this.themeService.reset();
    }
}
