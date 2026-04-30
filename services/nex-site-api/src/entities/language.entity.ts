import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('languages', { schema: 'nex_core' })
export class Language {
    @PrimaryGeneratedColumn({ name: 'language_id' })
    id: number;

    @Column({ name: 'language_code', unique: true, length: 10 })
    languageCode: string;       // 'th', 'en', 'ja', 'zh', etc.

    @Column({ name: 'language_name', length: 100 })
    languageName: string;       // 'Thai', 'English', etc.

    @Column({ length: 255, nullable: true })
    description: string;

    @Column({ name: 'is_active', default: true })
    isActive: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createdAt: Date;

    @Column({ name: 'create_by', nullable: true })
    createBy: string;

    @UpdateDateColumn({ name: 'update_date' })
    updatedAt: Date;

    @Column({ name: 'update_by', nullable: true })
    updateBy: string;
}
