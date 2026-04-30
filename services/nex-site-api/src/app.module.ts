import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PagesModule } from './pages/pages.module';
import { Page } from './entities/page.entity';
import { JobsModule } from './jobs/jobs.module';
import { Job } from './entities/job.entity';
import { ThemeModule } from './theme/theme.module';
import { ThemeSettings } from './entities/theme-settings.entity';
import { AuthModule } from './auth/auth.module';
import { AdminUser } from './entities/admin-user.entity';
import { AuthLog } from './entities/auth-log.entity';
import { ContactModule } from './contact/contact.module';
import { ContactSubmission } from './entities/contact-submission.entity';
import { TranslationsModule } from './translations/translations.module';
import { Language } from './entities/language.entity';
import { LanguageTranslation } from './entities/language-translation.entity';
import { SiteSettingsModule } from './site-settings/site-settings.module';
import { SiteSetting } from './entities/site-setting.entity';
import { PageViewLog } from './entities/page-view-log.entity';
import { SharedUser } from './entities/shared-user.entity';
import { Role } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { SystemApp } from './entities/system-app.entity';
import { SystemAppModule } from './system-app/system-app.module';
import { RolesModule } from './roles/roles.module';
import { Company } from './entities/company.entity';
import { CompanyModule } from './company/company.module';
import { EmailTemplate } from './entities/email-template.entity';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { MenusModule } from './menus/menus.module';
import { Menu } from './entities/menu.entity';
import { MasterDataModule } from './master-data/master-data.module';
import { Province } from './entities/province.entity';
import { UnitType } from './entities/unit-type.entity';

@Module({
  imports: [
    // Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development',
    }),

    // Database Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        schema: configService.get('DATABASE_SCHEMA', 'public'),
        entities: [Page, PageViewLog, Job, ThemeSettings, AdminUser, AuthLog, ContactSubmission, Language, LanguageTranslation, SiteSetting, Role, RolePermission, SystemApp, Company, EmailTemplate, Menu, Province, UnitType],
        synchronize: false,
        logging: configService.get('NODE_ENV') !== 'production',
      }),
      inject: [ConfigService],
    }),

    // Shared Database Connection (postgres.public — read-only for login)
    TypeOrmModule.forRootAsync({
      name: 'shared',
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        host: configService.get('DATABASE_HOST'),
        port: configService.get('DATABASE_PORT'),
        username: configService.get('DATABASE_USER'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        schema: 'public',
        entities: [SharedUser],
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),

    // Feature Modules
    PagesModule,
    JobsModule,
    ThemeModule,
    AuthModule,
    ContactModule,
    TranslationsModule,
    SiteSettingsModule,
    SystemAppModule,
    RolesModule,
    CompanyModule,
    EmailTemplatesModule,
    MenusModule,
    MasterDataModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
