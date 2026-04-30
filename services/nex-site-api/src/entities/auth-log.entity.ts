import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { AdminUser } from './admin-user.entity';

@Entity('auth_logs')
export class AuthLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ type: 'varchar', length: 100 })
    username: string;

    @Column({
        type: 'enum',
        enum: ['login', 'logout'],
    })
    action: 'login' | 'logout';

    @Column({ type: 'varchar', length: 45, nullable: true })
    ipAddress: string;

    @Column({ type: 'text', nullable: true })
    userAgent: string;

    @Column({ type: 'boolean', default: true })
    success: boolean;

    @Column({ type: 'text', nullable: true })
    failReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => AdminUser, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: AdminUser;
}
