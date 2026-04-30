import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';
import { Page } from '../entities/page.entity';

@Controller('api/pages')
export class PagesController {
    constructor(private readonly pagesService: PagesService) { }

    // Create a new page
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPageDto: CreatePageDto): Promise<Page> {
        return await this.pagesService.create(createPageDto);
    }

    // Get all pages
    @Get()
    async findAll(): Promise<Page[]> {
        return await this.pagesService.findAll();
    }

    // Get view stats by period
    @Get('view-stats')
    async getViewStats(@Query('period') period?: string) {
        const validPeriods = ['day', 'week', 'month', 'year'] as const;
        const p = validPeriods.includes(period as any) ? (period as any) : 'month';
        return await this.pagesService.getViewStats(p);
    }

    // Get view time-series by period
    @Get('view-time-series')
    async getViewTimeSeries(@Query('period') period?: string) {
        const validPeriods = ['day', 'week', 'month', 'year'] as const;
        const p = validPeriods.includes(period as any) ? (period as any) : 'month';
        return await this.pagesService.getViewTimeSeries(p);
    }

    // Get a page by slug (for frontend) - MUST be before :id route
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string): Promise<Page> {
        return await this.pagesService.findBySlug(slug);
    }

    // Get nav-visible pages (for frontend navbar) - MUST be before :id route
    @Get('nav-visible')
    async findNavVisible(): Promise<Page[]> {
        return await this.pagesService.findNavVisible();
    }

    // Get a single page by ID
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Page> {
        return await this.pagesService.findOne(id);
    }

    // Update a page
    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updatePageDto: UpdatePageDto,
    ): Promise<Page> {
        return await this.pagesService.update(id, updatePageDto);
    }

    // Delete a page
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        return await this.pagesService.remove(id);
    }

    // Publish a page
    @Put(':id/publish')
    async publish(@Param('id') id: string): Promise<Page> {
        return await this.pagesService.publish(id);
    }

    // Unpublish a page
    @Put(':id/unpublish')
    async unpublish(@Param('id') id: string): Promise<Page> {
        return await this.pagesService.unpublish(id);
    }

    // Toggle navbar visibility
    @Put(':id/toggle-nav')
    async toggleNavVisibility(@Param('id') id: string): Promise<Page> {
        return await this.pagesService.toggleNavVisibility(id);
    }
}
