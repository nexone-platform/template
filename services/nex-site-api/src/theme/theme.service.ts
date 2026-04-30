import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ThemeSettings } from '../entities/theme-settings.entity';

// Default theme values (TechBiz Convergence brand)
const DEFAULT_THEME = {
    name: 'default',
    isActive: true,
    brand: {
        primary: '#4a90e2',
        primaryDark: '#3672b9',
        primaryLight: '#6babf5',
        secondary: '#f562a6',
        secondaryDark: '#d44a8c',
        accent: '#8b5cf6',
    },
    sections: {
        navbar: { bg: '#4a90e2', textColor: '#ffffff' },
        hero: { bg: '#4a90e2', titleColor: '#ffffff', subtitleColor: 'rgba(255,255,255,0.8)' },
        features: { bg: '#f8fafc', titleColor: '#0f172a', cardBg: '#ffffff' },
        stats: { bg: '#f8faff', numberColor: 'gradient', labelColor: '#64748b' },
        testimonials: { bg: '#f8faff', textColor: '#334155', titleColor: '#0f172a' },
        portfolio: { bg: '#f8faff', titleColor: '#0f172a' },
        careers: { bg: '#ffffff', titleColor: '#0f172a' },
        cta: { bg: '#4a90e2', textColor: '#ffffff' },
        contact: { bg: '#ffffff', textColor: '#1e293b' },
        footer: { bg: '#4a90e2', textColor: '#ffffff', titleColor: '#ffffff' },
    },
    fonts: {
        primary: "'Sarabun', 'Leelawadee UI', sans-serif",
        headingWeight: '800',
        bodyWeight: '400',
    },
};

@Injectable()
export class ThemeService {
    constructor(
        @InjectRepository(ThemeSettings)
        private readonly themeRepo: Repository<ThemeSettings>,
    ) { }

    // Get the active theme (or create default if none exists)
    async getActive(): Promise<ThemeSettings> {
        let theme = await this.themeRepo.findOne({
            where: { isActive: true },
            order: { updatedAt: 'DESC' },
        });

        if (!theme) {
            // Create default theme on first access
            theme = this.themeRepo.create(DEFAULT_THEME);
            await this.themeRepo.save(theme);
        }

        return theme;
    }

    // Update the active theme
    async update(updateData: Partial<ThemeSettings>): Promise<ThemeSettings> {
        let theme = await this.themeRepo.findOne({
            where: { isActive: true },
            order: { updatedAt: 'DESC' },
        });

        if (!theme) {
            theme = this.themeRepo.create({ ...DEFAULT_THEME, ...updateData });
        } else {
            // Deep merge brand
            if (updateData.brand) {
                theme.brand = { ...theme.brand, ...updateData.brand };
            }
            // Deep merge sections
            if (updateData.sections) {
                theme.sections = theme.sections || {};
                for (const [key, val] of Object.entries(updateData.sections)) {
                    theme.sections[key] = { ...(theme.sections[key] || {}), ...val };
                }
            }
            // Deep merge fonts
            if (updateData.fonts) {
                theme.fonts = { ...theme.fonts, ...updateData.fonts };
            }
            if (updateData.name) {
                theme.name = updateData.name;
            }
        }

        return this.themeRepo.save(theme);
    }

    // Reset to defaults
    async reset(): Promise<ThemeSettings> {
        const theme = await this.getActive();
        theme.brand = DEFAULT_THEME.brand;
        theme.sections = DEFAULT_THEME.sections;
        theme.fonts = DEFAULT_THEME.fonts;
        return this.themeRepo.save(theme);
    }
}
