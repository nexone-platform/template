import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity';
import { Session } from '../entities/session.entity';
import { TenantRegistration } from '../registration/entities/tenant-registration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Session, TenantRegistration])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
