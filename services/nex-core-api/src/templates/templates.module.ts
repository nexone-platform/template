import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TemplateBasic } from '../entities/template-basic.entity';
import { TemplateCheckbox } from '../entities/template-checkbox.entity';
import { TemplateBasicService } from './template-basic.service';
import { TemplateCheckboxService } from './template-checkbox.service';
import { TemplateBasicController } from './template-basic.controller';
import { TemplateCheckboxController } from './template-checkbox.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TemplateBasic, TemplateCheckbox])],
  controllers: [TemplateBasicController, TemplateCheckboxController],
  providers: [TemplateBasicService, TemplateCheckboxService],
  exports: [TemplateBasicService, TemplateCheckboxService],
})
export class TemplatesModule {}
