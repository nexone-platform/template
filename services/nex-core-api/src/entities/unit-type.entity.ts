import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('unit_types', { schema: 'nex_core' })
export class UnitType {
    @PrimaryGeneratedColumn({ name: 'unit_type_id' })
    id: number;

    @Column({ name: 'unit_type_name', type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 25, nullable: true })
    symbol: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    status: boolean;

    @CreateDateColumn({ name: 'create_date', type: 'timestamptz' })
    createdAt: Date;

    @Column({ name: 'create_by', type: 'varchar', length: 50, nullable: true, default: 'system' })
    createdBy: string;

    @UpdateDateColumn({ name: 'update_date', nullable: true, type: 'timestamptz' })
    updatedAt: Date;

    @Column({ name: 'update_by', type: 'varchar', length: 50, nullable: true })
    updatedBy: string;
}
