import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    company_code: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    tax_id: string;

    @Column({ type: 'varchar', length: 255 })
    name_th: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    name_en: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    contact_person: string;

    @Column({ type: 'text', nullable: true })
    address: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    country: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    province: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    zipcode: string;

    @Column({ type: 'varchar', length: 150, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    phone: string;

    @Column({ type: 'varchar', length: 50, nullable: true })
    fax: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    website: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    logo_path: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    favicon_path: string;

    @Column({ type: 'boolean', default: true })
    isactive: boolean;

    @CreateDateColumn({ name: 'create_date' })
    createdAt: Date;

    @Column({ name: 'create_by', type: 'varchar', length: 50, nullable: true })
    createdBy: string;

    @UpdateDateColumn({ name: 'update_date' })
    updatedAt: Date;

    @Column({ name: 'update_by', type: 'varchar', length: 50, nullable: true })
    updatedBy: string;
}
