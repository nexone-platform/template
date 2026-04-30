import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { Page } from '../entities/page.entity';
import { PageViewLog } from '../entities/page-view-log.entity';
import { CreatePageDto } from '../dto/create-page.dto';
import { UpdatePageDto } from '../dto/update-page.dto';

@Injectable()
export class PagesService {
    constructor(
        @InjectRepository(Page)
        private pagesRepository: Repository<Page>,

        @InjectRepository(PageViewLog)
        private viewLogRepo: Repository<PageViewLog>,
    ) { }

    // Create a new page
    async create(createPageDto: CreatePageDto): Promise<Page> {
        const page = this.pagesRepository.create(createPageDto);
        return await this.pagesRepository.save(page);
    }

    // Get all pages
    async findAll(): Promise<Page[]> {
        return await this.pagesRepository.find({
            order: { updatedAt: 'DESC' },
        });
    }

    // Get a single page by ID
    async findOne(id: string): Promise<Page> {
        const page = await this.pagesRepository.findOne({ where: { id } });
        if (!page) {
            throw new NotFoundException(`Page with ID ${id} not found`);
        }
        return page;
    }

    // Get a page by slug
    async findBySlug(slug: string): Promise<Page> {
        const page = await this.pagesRepository.findOne({ where: { slug } });
        if (!page) {
            throw new NotFoundException(`Page with slug ${slug} not found`);
        }

        // Increment total views
        page.views += 1;
        await this.pagesRepository.save(page);

        // Record daily view log
        await this.recordDailyView(page);

        return page;
    }

    // ── Record daily view ──
    private async recordDailyView(page: Page): Promise<void> {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const existing = await this.viewLogRepo.findOne({
            where: { pageId: page.id, viewDate: today },
        });

        if (existing) {
            existing.viewCount += 1;
            await this.viewLogRepo.save(existing);
        } else {
            const log = this.viewLogRepo.create({
                pageId: page.id,
                pageSlug: page.slug,
                pageTitle: page.title,
                viewDate: today,
                viewCount: 1,
            });
            await this.viewLogRepo.save(log);
        }
    }

    // ── Get view stats by period ──
    async getViewStats(period: 'day' | 'week' | 'month' | 'year'): Promise<{
        pages: { pageId: string; pageTitle: string; pageSlug: string; views: number }[];
        total: number;
    }> {
        const now = new Date();
        let sinceDate: Date;

        switch (period) {
            case 'day':
                sinceDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                break;
            case 'week':
                sinceDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case 'month':
                sinceDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case 'year':
                sinceDate = new Date(now.getFullYear(), 0, 1);
                break;
        }

        const sinceDateStr = sinceDate.toISOString().slice(0, 10);

        const results = await this.viewLogRepo
            .createQueryBuilder('log')
            .select('log.pageId', 'pageId')
            .addSelect('log.pageTitle', 'pageTitle')
            .addSelect('log.pageSlug', 'pageSlug')
            .addSelect('SUM(log.viewCount)', 'views')
            .where('log.viewDate >= :sinceDate', { sinceDate: sinceDateStr })
            .groupBy('log.pageId')
            .addGroupBy('log.pageTitle')
            .addGroupBy('log.pageSlug')
            .orderBy('views', 'DESC')
            .getRawMany();

        const pages = results.map(r => ({
            pageId: r.pageId,
            pageTitle: r.pageTitle,
            pageSlug: r.pageSlug,
            views: parseInt(r.views, 10) || 0,
        }));

        const total = pages.reduce((s, p) => s + p.views, 0);

        return { pages, total };
    }

    // ── Get view time-series by period ──
    async getViewTimeSeries(period: 'day' | 'week' | 'month' | 'year'): Promise<{
        series: { label: string; views: number }[];
    }> {
        const now = new Date();

        if (period === 'day') {
            // Last 7 days → group by day-of-week
            const sinceDate = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            const sinceDateStr = sinceDate.toISOString().slice(0, 10);

            const results = await this.viewLogRepo
                .createQueryBuilder('log')
                .select('log.viewDate', 'viewDate')
                .addSelect('SUM(log.viewCount)', 'views')
                .where('log.viewDate >= :sinceDate', { sinceDate: sinceDateStr })
                .groupBy('log.viewDate')
                .orderBy('log.viewDate', 'ASC')
                .getRawMany();

            // Build array for last 7 days
            const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
            const series: { label: string; views: number }[] = [];
            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = d.toISOString().slice(0, 10);
                const found = results.find(r => r.viewDate === dateStr);
                series.push({
                    label: dayNames[d.getDay()],
                    views: found ? parseInt(found.views, 10) : 0,
                });
            }
            return { series };
        }

        if (period === 'week') {
            // Last 4 weeks
            const series: { label: string; views: number }[] = [];
            for (let w = 3; w >= 0; w--) {
                const weekEnd = new Date(now.getTime() - w * 7 * 24 * 60 * 60 * 1000);
                const weekStart = new Date(weekEnd.getTime() - 6 * 24 * 60 * 60 * 1000);
                const startStr = weekStart.toISOString().slice(0, 10);
                const endStr = weekEnd.toISOString().slice(0, 10);

                const result = await this.viewLogRepo
                    .createQueryBuilder('log')
                    .select('SUM(log.viewCount)', 'views')
                    .where('log.viewDate >= :start AND log.viewDate <= :end', { start: startStr, end: endStr })
                    .getRawOne();

                const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
                series.push({
                    label,
                    views: parseInt(result?.views, 10) || 0,
                });
            }
            return { series };
        }

        if (period === 'month') {
            // All 12 months of current year
            const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
            const year = now.getFullYear();
            const startStr = `${year}-01-01`;
            const endStr = `${year}-12-31`;

            const results = await this.viewLogRepo
                .createQueryBuilder('log')
                .select(`SUBSTRING(log.viewDate, 6, 2)`, 'month')
                .addSelect('SUM(log.viewCount)', 'views')
                .where('log.viewDate >= :start AND log.viewDate <= :end', { start: startStr, end: endStr })
                .groupBy(`SUBSTRING(log.viewDate, 6, 2)`)
                .orderBy('month', 'ASC')
                .getRawMany();

            const series = monthNames.map((name, idx) => {
                const monthNum = String(idx + 1).padStart(2, '0');
                const found = results.find(r => r.month === monthNum);
                return {
                    label: name,
                    views: found ? parseInt(found.views, 10) : 0,
                };
            });
            return { series };
        }

        // year: last 3 years
        const series: { label: string; views: number }[] = [];
        for (let y = now.getFullYear() - 2; y <= now.getFullYear(); y++) {
            const startStr = `${y}-01-01`;
            const endStr = `${y}-12-31`;

            const result = await this.viewLogRepo
                .createQueryBuilder('log')
                .select('SUM(log.viewCount)', 'views')
                .where('log.viewDate >= :start AND log.viewDate <= :end', { start: startStr, end: endStr })
                .getRawOne();

            series.push({
                label: `${y + 543}`,
                views: parseInt(result?.views, 10) || 0,
            });
        }
        return { series };
    }

    // Update a page
    async update(id: string, updatePageDto: UpdatePageDto): Promise<Page> {
        const page = await this.findOne(id);
        Object.assign(page, updatePageDto);
        return await this.pagesRepository.save(page);
    }

    // Delete a page
    async remove(id: string): Promise<void> {
        const page = await this.findOne(id);
        await this.pagesRepository.remove(page);
    }

    // Publish a page
    async publish(id: string): Promise<Page> {
        const page = await this.findOne(id);
        page.status = 'published';
        return await this.pagesRepository.save(page);
    }

    // Unpublish a page
    async unpublish(id: string): Promise<Page> {
        const page = await this.findOne(id);
        page.status = 'draft';
        return await this.pagesRepository.save(page);
    }

    // Toggle navbar visibility
    async toggleNavVisibility(id: string): Promise<Page> {
        const page = await this.findOne(id);
        page.isNavVisible = !page.isNavVisible;
        return await this.pagesRepository.save(page);
    }

    // Get only nav-visible pages (for frontend navbar)
    async findNavVisible(): Promise<Page[]> {
        return await this.pagesRepository.find({
            where: { isNavVisible: true },
            order: { createdAt: 'ASC' },
        });
    }
}
