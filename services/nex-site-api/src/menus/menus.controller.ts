import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseInterceptors, ClassSerializerInterceptor, Query } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('api/menus')
@UseInterceptors(ClassSerializerInterceptor)
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Post()
  create(@Body() createMenuDto: any) {
    return this.menusService.create(createMenuDto);
  }

  @Get()
  async findAll(@Query('app_name') appName?: string) {
    const data = await this.menusService.findAll(appName);
    return data;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMenuDto: any) {
    return this.menusService.update(+id, updateMenuDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menusService.remove(+id);
  }

  @Put(':id/status')
  toggleStatus(@Param('id') id: string, @Body('is_active') is_active: boolean) {
    return this.menusService.toggleStatus(+id, is_active);
  }
}
