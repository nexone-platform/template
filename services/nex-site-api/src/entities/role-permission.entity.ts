import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn
} from 'typeorm';
import { Role } from './role.entity';

@Entity('role_permissions')
export class RolePermission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'uuid' })
    roleId: string;

    @Column({ type: 'varchar', length: 100 })
    appName: string; // e.g. 'NexSpeed', 'NexForce'

    @Column({ type: 'boolean', default: false })
    canAccess: boolean;

    @Column({ type: 'boolean', default: false })
    canCreate: boolean;

    @Column({ type: 'boolean', default: false })
    canRead: boolean;

    @Column({ type: 'boolean', default: false })
    canUpdate: boolean;

    @Column({ type: 'boolean', default: false })
    canDelete: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Role, role => role.permissions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roleId' })
    role: Role;
}
