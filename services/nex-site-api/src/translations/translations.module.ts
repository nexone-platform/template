import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '../entities/language.entity';
import { LanguageTranslation } from '../entities/language-translation.entity';
import { TranslationsService } from './translations.service';
import { TranslationsController } from './translations.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Language, LanguageTranslation])],
    controllers: [TranslationsController],
    providers: [TranslationsService],
    exports: [TranslationsService],
})
export class TranslationsModule {}
