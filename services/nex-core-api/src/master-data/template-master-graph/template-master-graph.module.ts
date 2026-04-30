import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateMasterGraph } from '../../entities/template-master-graph.entity';
import { TemplateMasterGraphService } from './template-master-graph.service';
import { TemplateMasterGraphController } from './template-master-graph.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateMasterGraph])],
  controllers: [TemplateMasterGraphController],
  providers: [TemplateMasterGraphService],
  exports: [TemplateMasterGraphService],
})
export class TemplateMasterGraphModule {}
