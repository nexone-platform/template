import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from 'typeorm';

@Entity('language_translations')
@Unique(['languageCode', 'pageKey', 'labelKey'])
export class LanguageTranslation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 10 })
    languageCode: string;       // 'th', 'en', 'ja', etc.

    @Column({ length: 100 })
    pageKey: string;            // section/page: 'nav', 'hero', 'footer', etc.

    @Column({ length: 255 })
    labelKey: string;           // key: 'nav.home', 'hero.title', etc.

    @Column({ type: 'text', nullable: true })
    labelValue: string;         // translated text

    @Column({ type: 'boolean', default: true })
    is_active: boolean;         // active status

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
