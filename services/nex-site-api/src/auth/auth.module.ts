import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AdminUser } from '../entities/admin-user.entity';
import { AuthLog } from '../entities/auth-log.entity';
import { SharedUser } from '../entities/shared-user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([AdminUser, AuthLog]),
        TypeOrmModule.forFeature([SharedUser], 'shared'),
    ],
    controllers: [AuthController],
    providers: [AuthService],
    exports: [AuthService],
})
export class AuthModule implements OnModuleInit {
    constructor(private readonly authService: AuthService) { }

    // Auto-seed default users on startup
    async onModuleInit() {
        await this.authService.seedDefaultUsers();
    }
}
