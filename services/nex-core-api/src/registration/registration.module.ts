import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationController } from './registration.controller';
import { RegistrationService } from './registration.service';
import { TenantRegistration } from './entities/tenant-registration.entity';
import { BusinessType } from './entities/business-type.entity';
import { BusinessSubType } from './entities/business-sub-type.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TenantRegistration,
      BusinessType,
      BusinessSubType,
    ]),
  ],
  controllers: [RegistrationController],
  providers: [RegistrationService],
  exports: [RegistrationService],
})
export class RegistrationModule {}
