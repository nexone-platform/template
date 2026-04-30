import {
  Controller, Get, Post, Body, Param, Put, Delete,
  ParseIntPipe, Query,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../../entities/role.entity';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @AuditLog('Roles', 'Find All')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @AuditLog('Roles', 'Find One')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @AuditLog('Roles', 'Create')
  create(@Body() createDto: Partial<Role>) {
    return this.rolesService.create(createDto);
  }

  @Put(':id')
  @AuditLog('Roles', 'Update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: Partial<Role>) {
    return this.rolesService.update(id, updateDto);
  }

  @Delete(':id')
  @AuditLog('Roles', 'Remove')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  /** GET /api/roles/:id/permissions?app=nex-core */
  @Get(':id/permissions')
  @AuditLog('Roles', 'Get Permissions')
  getPermissions(
    @Param('id', ParseIntPipe) id: number,
    @Query('app') app: string = 'nex-core',
  ) {
    return this.rolesService.getMenusWithPermissions(id, app);
  }

  /** POST /api/roles/:id/permissions?app=nex-core */
  @Post(':id/permissions')
  @AuditLog('Roles', 'Save Permissions')
  savePermissions(
    @Param('id', ParseIntPipe) id: number,
    @Query('app') app: string = 'nex-core',
    @Body() body: { permissions: any[] },
  ) {
    return this.rolesService.savePermissions(id, app, body.permissions);
  }
}
