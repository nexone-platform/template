import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, ClassSerializerInterceptor, Query } from '@nestjs/common';
import { MenusService } from './menus.service';
import { AuditLog } from '../common/decorators/audit-log.decorator';

@Controller('menus')
@UseInterceptors(ClassSerializerInterceptor)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  @AuditLog('Menus', 'Create')
  create(@Body() createMenuDto: any) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  @AuditLog('Menus', 'Find All')
  async findAll(@Query('app_name') appName?: string) {
    const data = await this.menusService.findAll(appName);
    return data;
  }

  @Get(':id')
  @AuditLog('Menus', 'Find One')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(+id);
  }

  @Put(':id')
  @AuditLog('Menus', 'Update')
  update(@Param('id') id: string, @Body() updateMenuDto: any) {
    return this.menusService.update(+id, updateMenuDto);
  }

  @Delete(':id')
  @AuditLog('Menus', 'Remove')
  remove(@Param('id') id: string) {
    return this.menusService.remove(+id);
  }

  @Put(':id/status')
  @AuditLog('Menus', 'Toggle Status')
  toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
    return this.menusService.toggleStatus(+id, is_active);
  }
}
