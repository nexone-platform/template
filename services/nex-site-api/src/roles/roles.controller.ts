import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../entities/role.entity';

@Controller('api/v1/roles')
export class RolesController {
    constructor(private readonly rolesService: RolesService) {}

    @Get()
    async findAll(): Promise<{ data: Role[] }> {
        const roles = await this.rolesService.findAll();
        return { data: roles };
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<{ data: Role }> {
        const role = await this.rolesService.findOne(id);
        return { data: role };
    }

    @Post()
    async create(@Body() createData: Partial<Role>): Promise<{ data: Role }> {
        const role = await this.rolesService.create(createData);
        return { data: role };
    }

    @Put(':id')
    async update(
        @Param('id') id: string,
        @Body() updateData: Partial<Role>,
    ): Promise<{ data: Role }> {
        const updated = await this.rolesService.update(id, updateData);
        return { data: updated };
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<{ success: boolean }> {
        await this.rolesService.remove(id);
        return { success: true };
    }
}
