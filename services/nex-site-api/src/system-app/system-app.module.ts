import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemApp } from '../entities/system-app.entity';
import { SystemAppService } from './system-app.service';
import { SystemAppController } from './system-app.controller';

@Module({
    imports: [TypeOrmModule.forFeature([SystemApp])],
    controllers: [SystemAppController],
    providers: [SystemAppService],
    exports: [SystemAppService],
})
export class SystemAppModule {}
