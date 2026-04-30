import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { Province } from '../../entities/province.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('provinces')
export class ProvincesController {
    constructor(private readonly provincesService: ProvincesService) {}

    @Get()
  @AuditLog('Provinces', 'Find All')
  findAll() {
        return this.provincesService.findAll();
    }

    @Get(':id')
  @AuditLog('Provinces', 'Find One')
  findOne(@Param('id') id: string) {
        return this.provincesService.findOne(+id);
    }

    @Post()
  @AuditLog('Provinces', 'Create')
  create(@Body() data: Partial<Province>) {
        return this.provincesService.create(data);
    }

    @Put(':id')
  @AuditLog('Provinces', 'Update')
  update(@Param('id') id: string, @Body() data: Partial<Province>) {
        return this.provincesService.update(+id, data);
    }

    @Delete(':id')
  @AuditLog('Provinces', 'Remove')
  remove(@Param('id') id: string) {
        return this.provincesService.remove(+id);
    }
}
