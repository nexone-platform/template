import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { UnitTypesService } from './unit-types.service';
import { UnitType } from '../entities/unit-type.entity';

@Controller('api/unit-types')
export class UnitTypesController {
    constructor(private readonly unitTypesService: UnitTypesService) {}

    @Get()
    findAll() {
        return this.unitTypesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.unitTypesService.findOne(+id);
    }

    @Post()
    create(@Body() data: Partial<UnitType>) {
        return this.unitTypesService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Partial<UnitType>) {
        return this.unitTypesService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.unitTypesService.remove(+id);
    }
}
