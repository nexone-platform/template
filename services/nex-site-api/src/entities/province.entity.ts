import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('provinces', { schema: 'nex_core' })
export class Province {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name_en: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    abbr: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    region: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
