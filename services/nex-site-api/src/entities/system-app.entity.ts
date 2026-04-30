import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('system_apps')
export class SystemApp {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    app_name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    desc_en: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    desc_th: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    icon_path: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    theme_color: string;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    status: string;

    @Column({ type: 'int', default: 0 })
    seq_no: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
