import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
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
import { AuthGuard } from './auth/auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env.development',
    }),

    // ── Rate Limiting (Brute Force Protection) ──
    ThrottlerModule.forRoot([{
      ttl: 60000,    // 60 seconds window
      limit: 30,     // 30 requests per window (global)
    }]),

    // ── Scheduled Tasks (Session Cleanup) ──
    ScheduleModule.forRoot(),

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

    // ── Global Auth Guard: ALL routes require login unless @Public() ──
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },

    // ── Global Roles Guard: Check @Roles() on protected routes ──
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },

    // ── Global Rate Limiter ──
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    // ── Audit Logging ──
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
