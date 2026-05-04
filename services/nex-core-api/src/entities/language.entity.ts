import {
    Entity,
    PrimaryColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert
} from 'typeorm';
import { v7 as uuidv7 } from 'uuid';

@Entity('languages', { schema: 'nex_core' })
export class Language {
    @PrimaryColumn('uuid', { name: 'language_id' })
    id: string;

    @BeforeInsert()
    generateId() {
        if (!this.id) {
            this.id = uuidv7();
        }
    }

    @Column({ name: 'language_code', unique: true, length: 10, nullable: true })
    languageCode: string;       // 'th', 'en', 'ja', 'zh', etc.

    @Column({ name: 'language_name', length: 100, nullable: true })
    languageName: string;       // 'Thai', 'English', etc.

    @Column({ length: 255, nullable: true })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'create_date', type: 'timestamptz', nullable: true })
    createdAt: Date;

    @Column({ name: 'create_by', type: 'uuid', nullable: true })
    createBy: string;

    @UpdateDateColumn({ name: 'update_date', type: 'timestamptz', nullable: true })
    updatedAt: Date;

    @Column({ name: 'update_by', type: 'uuid', nullable: true })
    updateBy: string;
}
