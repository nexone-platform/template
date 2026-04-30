import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('pages')
export class Page {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    slug: string;

    @Column({ type: 'jsonb', nullable: true })
    layout: any;

    @Column({ type: 'jsonb', nullable: true })
    seoMeta: {
        title: string;
        description: string;
        keywords: string[];
    };

    @Column({
        type: 'enum',
        enum: ['draft', 'published'],
        default: 'draft',
    })
    status: 'draft' | 'published';

    @Column({ type: 'int', default: 0 })
    views: number;

    @Column({ type: 'boolean', default: true })
    isNavVisible: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
