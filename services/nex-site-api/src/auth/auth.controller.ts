import { Controller, Post, Get, Put, Delete, Body, Req, Query, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login.dto';
import { LogoutDto } from '../dto/logout.dto';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { Request } from 'express';

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    // POST /api/auth/login
    @Post('login')
    async login(
        @Body() body: LoginDto,
        @Req() req: Request,
    ) {
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        return this.authService.login(
            body.username,
            body.password,
            ipAddress,
            userAgent,
        );
    }

    // POST /api/auth/logout
    @Post('logout')
    async logout(
        @Body() body: LogoutDto,
        @Req() req: Request,
    ) {
        const ipAddress =
            (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown';
        const userAgent = req.headers['user-agent'] || 'unknown';

        await this.authService.logout(
            body.userId,
            body.username,
            ipAddress,
            userAgent,
        );
        return { success: true, message: 'ออกจากระบบสำเร็จ' };
    }

    // GET /api/auth/logs?limit=50
    @Get('logs')
    async getLogs(@Query('limit') limit?: string) {
        const take = limit ? parseInt(limit, 10) : 50;
        return this.authService.getLogs(take);
    }

    // GET /api/auth/users
    @Get('users')
    async getUsers() {
        return this.authService.getUsers();
    }

    // GET /api/auth/shared-users — ดึงรายชื่อจาก shared table (สำหรับ import)
    @Get('shared-users')
    async getSharedUsers() {
        return this.authService.getSharedUsers();
    }

    // POST /api/auth/users — สร้างผู้ใช้ใหม่
    @Post('users')
    async createUser(@Body() body: CreateUserDto) {
        return this.authService.createUser(body);
    }

    // PUT /api/auth/users/:id — แก้ไขผู้ใช้
    @Put('users/:id')
    async updateUser(
        @Param('id') id: string,
        @Body() body: UpdateUserDto,
    ) {
        return this.authService.updateUser(id, body);
    }

    // DELETE /api/auth/users/:id — ลบผู้ใช้
    @Delete('users/:id')
    async deleteUser(@Param('id') id: string) {
        return this.authService.deleteUser(id);
    }
}
