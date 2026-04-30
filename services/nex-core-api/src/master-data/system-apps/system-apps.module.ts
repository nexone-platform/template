import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemAppsService } from './system-apps.service';
import { SystemAppsController } from './system-apps.controller';
import { SystemApp } from './entities/system-app.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemApp])],
  controllers: [SystemAppsController],
  providers: [SystemAppsService],
})
export class SystemAppsModule {}
