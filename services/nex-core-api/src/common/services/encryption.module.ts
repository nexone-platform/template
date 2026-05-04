import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EncryptionService } from './encryption.service';
import { SystemConfig } from '../../entities/system-config.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig])],
  providers: [EncryptionService],
  exports: [EncryptionService],
})
export class EncryptionModule {}
