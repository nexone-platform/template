import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TemplateBasicService } from './template-basic.service';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('template-basic')
@UseInterceptors(ClassSerializerInterceptor)
export class TemplateBasicController {
  constructor(private readonly templateBasicService: TemplateBasicService) {}

  @Get()
  @AuditLog('TemplateBasic', 'Find All')
  findAll() {
    return this.templateBasicService.findAll();
  }

  @Get(':id')
  @AuditLog('TemplateBasic', 'Find One')
  findOne(@Param('id') id: string) {
    return this.templateBasicService.findOne(+id);
  }

  @Post()
  @AuditLog('TemplateBasic', 'Create')
  create(@Body() dto: any) {
    return this.templateBasicService.create(dto);
  }

  @Put(':id')
  @AuditLog('TemplateBasic', 'Update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.templateBasicService.update(+id, dto);
  }

  @Delete(':id')
  @AuditLog('TemplateBasic', 'Remove')
  remove(@Param('id') id: string) {
    return this.templateBasicService.remove(+id);
  }

  @Put(':id/status')
  @AuditLog('TemplateBasic', 'Toggle Status')
  toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
    return this.templateBasicService.toggleStatus(+id, is_active);
  }
}
