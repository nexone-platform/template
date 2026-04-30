import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { UnitType } from '../../entities/unit-type.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('unit-types')
export class UnitTypesController {
    constructor(private readonly unitTypesService: UnitTypesService) {}

    @Get()
  @AuditLog('Unit Types', 'Find All')
  findAll() {
        return this.unitTypesService.findAll();
    }

    @Get(':id')
  @AuditLog('Unit Types', 'Find One')
  findOne(@Param('id') id: string) {
        return this.unitTypesService.findOne(+id);
    }

    @Post()
  @AuditLog('Unit Types', 'Create')
  create(@Body() data: Partial<UnitType>) {
        return this.unitTypesService.create(data);
    }

    @Put(':id')
  @AuditLog('Unit Types', 'Update')
  update(@Param('id') id: string, @Body() data: Partial<UnitType>) {
        return this.unitTypesService.update(+id, data);
    }

    @Delete(':id')
  @AuditLog('Unit Types', 'Remove')
  remove(@Param('id') id: string) {
        return this.unitTypesService.remove(+id);
    }
}
