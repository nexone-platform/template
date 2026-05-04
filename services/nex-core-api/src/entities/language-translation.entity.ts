import {
    Entity,
    PrimaryColumn,
    Column,
    Unique,
    BeforeInsert
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('language_translations', { schema: 'nex_core' })
@Unique(['languageCode', 'labelKey'])
export class LanguageTranslation {
    @PrimaryColumn('uuid', { name: 'translation_id' })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv7();
        }
    }

    @Column({ name: 'language_code', length: 10, nullable: true })
    languageCode: string;       // 'th', 'en', 'ja', etc.

    @Column({ name: 'page_key', length: 100, nullable: true })
    pageKey: string;            // section/page: 'nav', 'hero', 'footer', etc.

    @Column({ name: 'label_key', length: 255, nullable: true })
    labelKey: string;           // key: 'nav.home', 'hero.title', etc.

    @Column({ name: 'label_value', type: 'text', nullable: true })
    labelValue: string;         // translated text

    @Column({ name: 'is_active', type: 'boolean', default: true })
    is_active: boolean;         // active status

    @Column({ name: 'create_date', type: 'timestamptz', nullable: true })
    createdAt: Date;

    @Column({ name: 'create_by', type: 'uuid', nullable: true })
    createBy: string;

    @Column({ name: 'update_date', type: 'timestamptz', nullable: true })
    updatedAt: Date;

    @Column({ name: 'update_by', type: 'uuid', nullable: true })
    updateBy: string;
}
