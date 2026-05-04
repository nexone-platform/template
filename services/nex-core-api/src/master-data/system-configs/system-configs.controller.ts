import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { SystemConfigsService } from './system-configs.service';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('system-configs')
export class SystemConfigsController {
  constructor(private readonly systemConfigsService: SystemConfigsService) {}

  @Post()
  @Roles('admin', 'superadmin')
  create(@Body() createSystemConfigDto: CreateSystemConfigDto, @Request() req: any) {
    return this.systemConfigsService.create(createSystemConfigDto, req.user);
  }

  @Get()
  @Roles('admin', 'superadmin')
  findAll() {
    return this.systemConfigsService.findAll();
  }

  @Get('key/:key')
  findByKey(@Param('key') key: string) {
    return this.systemConfigsService.findByKey(key);
  }

  @Get(':id')
  @Roles('admin', 'superadmin')
  findOne(@Param('id') id: string) {
    return this.systemConfigsService.findOne(+id);
  }

  @Patch(':id')
  @Roles('admin', 'superadmin')
  update(@Param('id') id: string, @Body() updateSystemConfigDto: UpdateSystemConfigDto, @Request() req: any) {
    return this.systemConfigsService.update(+id, updateSystemConfigDto, req.user);
  }

  @Delete(':id')
  @Roles('superadmin')
  remove(@Param('id') id: string) {
    return this.systemConfigsService.remove(+id);
  }
}
