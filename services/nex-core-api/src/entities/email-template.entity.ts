import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'email_templates', schema: 'nex_core' })
export class EmailTemplate {
    @PrimaryGeneratedColumn()
    template_id: number;

    @Column({ type: 'varchar', length: 100 })
    template_code: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    language_code: string;

    @Column({ type: 'jsonb', nullable: true })
    app_name: string[];

    @Column({ type: 'text', nullable: true })
    email_content: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'varchar', length: 50, nullable: true })
    create_by: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    update_by: string;

    @CreateDateColumn({ type: 'timestamptz', nullable: true })
    create_date: Date;

    @UpdateDateColumn({ type: 'timestamptz', nullable: true })
    update_date: Date;
}
