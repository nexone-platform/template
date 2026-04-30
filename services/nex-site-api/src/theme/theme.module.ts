import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeSettings } from '../entities/theme-settings.entity';
import { ThemeService } from './theme.service';
import { ThemeController } from './theme.controller';

@Module({
    imports: [TypeOrmModule.forFeature([ThemeSettings])],
    controllers: [ThemeController],
    providers: [ThemeService],
    exports: [ThemeService],
})
export class ThemeModule { }
