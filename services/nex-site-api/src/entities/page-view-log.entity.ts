import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from 'typeorm';

@Entity('page_view_logs')
@Index(['pageId', 'viewDate'], { unique: true })
export class PageViewLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    @Index()
    pageId: string;

    @Column({ type: 'varchar', length: 255 })
    pageSlug: string;

    @Column({ type: 'varchar', length: 255 })
    pageTitle: string;

    @Column({ type: 'date' })
    @Index()
    viewDate: string;

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @CreateDateColumn()
    createdAt: Date;
}
