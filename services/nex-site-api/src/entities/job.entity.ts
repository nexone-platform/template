import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('jobs')
export class Job {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'varchar', length: 255 })
    department: string;

    @Column({ type: 'varchar', length: 100 })
    location: string;

    @Column({ type: 'varchar', length: 50 })
    type: string; // full-time, part-time, internship, contract

    @Column({ type: 'varchar', length: 100, nullable: true })
    salary: string; // e.g. "35,000 - 60,000 บาท"

    @Column({ type: 'text' })
    description: string;

    @Column({ type: 'jsonb', nullable: true, default: [] })
    responsibilities: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    qualifications: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    benefits: string[];

    @Column({ type: 'jsonb', nullable: true, default: [] })
    tags: string[];

    @Column({
        type: 'enum',
        enum: ['open', 'closed', 'draft'],
        default: 'open',
    })
    status: 'open' | 'closed' | 'draft';

    @Column({ type: 'int', default: 0 })
    views: number;

    @Column({ type: 'timestamp', nullable: true })
    closingDate: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
