import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';

@Entity('theme_settings')
export class ThemeSettings {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 100, default: 'default' })
    name: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    brand: {
        primary: string;
        primaryDark: string;
        primaryLight: string;
        secondary: string;
        secondaryDark: string;
        accent: string;
    };

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    sections: Record<string, {
        bg?: string;
        textColor?: string;
        titleColor?: string;
        subtitleColor?: string;
        cardBg?: string;
        numberColor?: string;
        labelColor?: string;
    }>;

    @Column({ type: 'jsonb', default: () => "'{}'::jsonb" })
    fonts: {
        primary?: string;
        headingWeight?: string;
        bodyWeight?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
