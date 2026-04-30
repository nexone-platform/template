import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SystemAppsModule } from './master-data/system-apps/system-apps.module';
import { UnitTypesModule } from './master-data/unit-types/unit-types.module';
import { ProvincesModule } from './master-data/provinces/provinces.module';
import { MenusModule } from './menus/menus.module';
import { TranslationsModule } from './translations/translations.module';
import { CompanyModule } from './company/company.module';
import { EmailTemplatesModule } from './email-templates/email-templates.module';
import { TemplatesModule } from './templates/templates.module';
import { RolesModule } from './master-data/roles/roles.module';
import { TemplateMasterGraphModule } from './master-data/template-master-graph/template-master-graph.module';
import { ThemesModule } from './master-data/themes/themes.module';
import { AuditLogsModule } from './master-data/audit-logs/audit-logs.module';
import { NotificationsModule } from './master-data/notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { AuthModule } from './auth/auth.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'),
        schema: configService.get<string>('DATABASE_SCHEMA'),
        autoLoadEntities: true,
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    SystemAppsModule,
    UnitTypesModule,
    ProvincesModule,
    MenusModule,
    TranslationsModule,
    CompanyModule,
    EmailTemplatesModule,
    TemplatesModule,
    RolesModule,
    TemplateMasterGraphModule,
    ThemesModule,
    AuditLogsModule,
    NotificationsModule,
    DashboardModule,
    AnnouncementsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
