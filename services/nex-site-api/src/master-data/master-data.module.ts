import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Province } from '../entities/province.entity';
import { UnitType } from '../entities/unit-type.entity';
import { ProvincesController } from './provinces.controller';
import { UnitTypesController } from './unit-types.controller';
import { ProvincesService } from './provinces.service';
import { UnitTypesService } from './unit-types.service';

@Module({
    imports: [TypeOrmModule.forFeature([Province, UnitType])],
    controllers: [ProvincesController, UnitTypesController],
    providers: [ProvincesService, UnitTypesService],
    exports: [ProvincesService, UnitTypesService],
})
export class MasterDataModule {}
