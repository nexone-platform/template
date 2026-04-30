import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Theme } from './entities/theme.entity';

@Injectable()
export class ThemesService {
  constructor(
    @InjectRepository(Theme)
    private themeRepository: Repository<Theme>,
  ) {}

  async getActiveTheme(): Promise<Theme | null> {
    // Return the first active theme or default to ID 1
    let theme = await this.themeRepository.findOne({ where: { is_active: true } });
    if (!theme) {
      theme = await this.themeRepository.findOne({ where: { theme_id: 1 } });
    }
    return theme;
  }

  async updateTheme(id: number, updateData: Partial<Theme>): Promise<Theme | null> {
    const { theme_id, create_date, ...dataToUpdate } = updateData;
    await this.themeRepository.update(id, {
      ...dataToUpdate,
      update_date: new Date(),
    });
    return this.themeRepository.findOne({ where: { theme_id: id } });
  }
}
