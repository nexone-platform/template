import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('provinces', { schema: 'nex_core' })
export class Province {
    @PrimaryGeneratedColumn({ name: 'province_id' })
    province_id: number;

    @Column({ type: 'varchar', length: 255, name: 'province_name' })
    province_name: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    abbr: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    region: string;

    @Column({ type: 'boolean', default: true, name: 'is_active' })
    is_active: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'create_by' })
    create_by: string;

    @Column({ type: 'varchar', length: 255, nullable: true, name: 'update_by' })
    update_by: string;

    @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'update_date', type: 'timestamptz' })
    updatedAt: Date;
}
