import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { TemplatesService } from './templates.service';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('templates')
@UseInterceptors(ClassSerializerInterceptor)
export class TemplatesController {
  constructor(private readonly templatesService: TemplatesService) {}

  @Get()
  @AuditLog('Templates', 'Find All')
  findAll() {
    return this.templatesService.findAll();
  }

  @Get(':id')
  @AuditLog('Templates', 'Find One')
  findOne(@Param('id') id: string) {
    return this.templatesService.findOne(+id);
  }

  @Post()
  @AuditLog('Templates', 'Create')
  create(@Body() dto: any) {
    return this.templatesService.create(dto);
  }

  @Put(':id')
  @AuditLog('Templates', 'Update')
  update(@Param('id') id: string, @Body() dto: any) {
    return this.templatesService.update(+id, dto);
  }

  @Delete(':id')
  @AuditLog('Templates', 'Remove')
  remove(@Param('id') id: string) {
    return this.templatesService.remove(+id);
  }

  @Put(':id/status')
  @AuditLog('Templates', 'Toggle Status')
  toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
    return this.templatesService.toggleStatus(+id, is_active);
  }
}
