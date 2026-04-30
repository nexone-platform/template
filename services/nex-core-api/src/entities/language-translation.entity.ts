import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    Unique,
} from 'typeorm';

@Entity('language_translations', { schema: 'nex_core' })
@Unique(['languageCode', 'labelKey'])
export class LanguageTranslation {
    @PrimaryGeneratedColumn({ name: 'translation_id' })
    id: number;

    @Column({ name: 'language_code', length: 10 })
    languageCode: string;       // 'th', 'en', 'ja', etc.

    @Column({ name: 'page_key', length: 100 })
    pageKey: string;            // section/page: 'nav', 'hero', 'footer', etc.

    @Column({ name: 'label_key', length: 255 })
    labelKey: string;           // key: 'nav.home', 'hero.title', etc.

    @Column({ name: 'label_value', type: 'text', nullable: true })
    labelValue: string;         // translated text

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;         // active status

    @Column({ name: 'create_date', type: 'timestamp', nullable: true })
    createdAt: Date;

    @Column({ name: 'create_by', nullable: true })
    createBy: string;

    @Column({ name: 'update_date', type: 'timestamp', nullable: true })
    updatedAt: Date;

    @Column({ name: 'update_by', nullable: true })
    updateBy: string;
}
