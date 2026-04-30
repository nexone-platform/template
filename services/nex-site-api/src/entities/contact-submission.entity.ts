import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('contact_submissions')
export class ContactSubmission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    email: string;

    @Column({ nullable: true, default: '' })
    phone: string;

    @Column({ nullable: true, default: '' })
    company: string;

    @Column()
    subject: string;

    @Column({ nullable: true, default: '' })
    service: string;

    @Column({ type: 'text' })
    message: string;

    @Column({
        type: 'enum',
        enum: ['new', 'read', 'replied', 'archived'],
        default: 'new',
    })
    status: 'new' | 'read' | 'replied' | 'archived';

    @Column({ nullable: true })
    ipAddress: string;

    @Column({ nullable: true })
    userAgent: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
