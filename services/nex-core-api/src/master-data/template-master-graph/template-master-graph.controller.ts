import {
  Controller, Get, Post, Body, Param, Put, Delete,
  ParseIntPipe, Patch,
} from '@nestjs/common';
import { TemplateMasterGraphService } from './template-master-graph.service';
import { TemplateMasterGraph } from '../../entities/template-master-graph.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('template-master-graph')
export class TemplateMasterGraphController {
  constructor(private readonly service: TemplateMasterGraphService) {}

  @Get()
  @AuditLog('Template Master Graph', 'Find All')
  findAll() {
    return this.service.findAll();
  }

  @Get('summary')
  @AuditLog('Template Master Graph', 'Get Summary')
  getSummary() {
    return this.service.getSummary();
  }

  @Get(':id')
  @AuditLog('Template Master Graph', 'Find One')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Post()
  @AuditLog('Template Master Graph', 'Create')
  create(@Body() dto: Partial<TemplateMasterGraph>) {
    return this.service.create(dto);
  }

  @Put(':id')
  @AuditLog('Template Master Graph', 'Update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<TemplateMasterGraph>) {
    return this.service.update(id, dto);
  }

  @Patch(':id/status')
  @AuditLog('Template Master Graph', 'Toggle Status')
  toggleStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { is_active: boolean },
  ) {
    return this.service.toggleStatus(id, body.is_active);
  }

  @Delete(':id')
  @AuditLog('Template Master Graph', 'Remove')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
