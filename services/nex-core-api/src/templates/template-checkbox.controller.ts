import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { TemplateCheckboxService } from './template-checkbox.service';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('template-checkbox')
export class TemplateCheckboxController {
  constructor(private readonly templateCheckboxService: TemplateCheckboxService) {}

  @Get()
  @AuditLog('TemplateCheckbox', 'Find All')
  findAll() {
    return this.templateCheckboxService.findAll();
  }

  @Get(':id')
  @AuditLog('TemplateCheckbox', 'Find One')
  findOne(@Param('id') id: string) {
    return this.templateCheckboxService.findOne(id);
  }

  @Post()
  @AuditLog('TemplateCheckbox', 'Create')
  create(@Body() dto: any) {
    return this.templateCheckboxService.create(dto);
  }

  @Put(':id')
  @AuditLog('TemplateCheckbox', 'Update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.templateCheckboxService.update(id, dto);
  }

  @Delete(':id')
  @AuditLog('TemplateCheckbox', 'Remove')
  remove(@Param('id') id: string) {
    return this.templateCheckboxService.remove(id);
  }
}
