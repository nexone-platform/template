import {
    Entity,
    Column,
    PrimaryColumn,
} from 'typeorm';

/**
 * Shared user table in postgres.public schema
 * Used ONLY for login authentication (username + password)
 * Table: auth-tb-ms-user
 */
@Entity('shared_users')
export class SharedUser {
    @PrimaryColumn({ name: 'user_id', type: 'numeric' })
    userId: number;

    @Column({ name: 'employee_id', type: 'varchar', nullable: true })
    employeeId: string;

    @Column({ type: 'varchar', nullable: true })
    email: string;

    @Column({ type: 'varchar', nullable: true })
    password: string;

    @Column({ type: 'varchar', nullable: true })
    salt: string;

    @Column({ name: 'is_active', type: 'boolean', nullable: true })
    isActive: boolean;

    @Column({ name: 'role_id', type: 'integer', nullable: true })
    roleId: number;

    @Column({ name: 'create_date', type: 'timestamp', nullable: true })
    createDate: Date;
}
