import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('admin_users')
export class AdminUser {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255 })
    password: string; // plain text for now — use bcrypt in production

    @Column({ type: 'varchar', length: 255 })
    displayName: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({
        type: 'enum',
        enum: ['admin', 'editor'],
        default: 'editor',
    })
    role: 'admin' | 'editor';

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'simple-json', nullable: true, default: '["dashboard","pages","builder","theme","translations","analytics","settings"]' })
    allowedPages: string[];

    @Column({ type: 'timestamp', nullable: true })
    lastLoginAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
