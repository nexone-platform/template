import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ProvincesService } from './provinces.service';
import { Province } from '../entities/province.entity';

@Controller('api/provinces')
export class ProvincesController {
    constructor(private readonly provincesService: ProvincesService) {}

    @Get()
    findAll() {
        return this.provincesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.provincesService.findOne(+id);
    }

    @Post()
    create(@Body() data: Partial<Province>) {
        return this.provincesService.create(data);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() data: Partial<Province>) {
        return this.provincesService.update(+id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.provincesService.remove(+id);
    }
}
