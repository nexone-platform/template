import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { SystemAppsService } from './system-apps.service';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('v1/system-apps')
export class SystemAppsController {
  constructor(private readonly systemAppsService: SystemAppsService) {}

  @Get()
  @AuditLog('System Apps', 'Find All')
  async findAll(@Query('all') all: string) {
    const data = await this.systemAppsService.findAll(all);
    return { data }; 
  }

  @Post()
  @AuditLog('System Apps', 'Create')
  create(@Body() createSystemAppDto: any) {
    return this.systemAppsService.create(createSystemAppDto);
  }

  @Put(':id')
  @AuditLog('System Apps', 'Update')
  update(@Param('id') id: string, @Body() updateSystemAppDto: any) {
    return this.systemAppsService.update(+id, updateSystemAppDto);
  }

  @Delete(':id')
  @AuditLog('System Apps', 'Remove')
  remove(@Param('id') id: string) {
    return this.systemAppsService.remove(+id);
  }
}
