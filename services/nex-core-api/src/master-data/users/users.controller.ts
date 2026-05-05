import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @AuditLog('Users', 'Create User')
  create(@Body() createUserDto: any, @Req() req: any) {
    return this.usersService.create(createUserDto, req.user?.userId);
  }

  @Get()
  @Roles('admin')
  @AuditLog('Users', 'List Users')
  findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('search') search: string
  ) {
    return this.usersService.findAll(Number(page) || 1, Number(limit) || 20, search || '');
  }

  @Get(':id')
  @Roles('admin')
  @AuditLog('Users', 'Get User')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  @AuditLog('Users', 'Update User')
  update(@Param('id') id: string, @Body() updateUserDto: any, @Req() req: any) {
    return this.usersService.update(id, updateUserDto, req.user?.userId);
  }

  @Delete(':id')
  @Roles('admin')
  @AuditLog('Users', 'Delete User')
  remove(@Param('id') id: string, @Req() req: any) {
    return this.usersService.remove(id, req.user?.userId);
  }
}
