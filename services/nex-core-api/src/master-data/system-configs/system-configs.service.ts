import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../entities/system-config.entity';
import { CreateSystemConfigDto } from './dto/create-system-config.dto';
import { UpdateSystemConfigDto } from './dto/update-system-config.dto';

@Injectable()
export class SystemConfigsService implements OnModuleInit {
  private readonly logger = new Logger(SystemConfigsService.name);

  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepository: Repository<SystemConfig>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultConfigs();
  }

  private async seedDefaultConfigs() {
    const defaultConfigs = [
      {
        systemGroup: 'SYSTEM',
        systemKey: 'MAINTENANCE_MODE',
        systemValue: 'false',
        systemType: 'boolean',
        description: 'Toggle to put the system into maintenance mode',
      },
      {
        systemGroup: 'SECURITY',
        systemKey: 'SESSION_TIMEOUT_MIN',
        systemValue: '30',
        systemType: 'number',
        description: 'Session timeout in minutes',
      },
      {
        systemGroup: 'SECURITY',
        systemKey: 'MAX_LOGIN_ATTEMPT',
        systemValue: '5',
        systemType: 'number',
        description: 'Maximum failed login attempts before locking account',
      },
      {
        systemGroup: 'SECURITY',
        systemKey: 'PASSWORD_EXPIRE_DAYS',
        systemValue: '90',
        systemType: 'number',
        description: 'Days before user must reset password',
      },
      {
        systemGroup: 'SECURITY',
        systemKey: 'ENABLE_DB_ENCRYPT',
        systemValue: 'true',
        systemType: 'boolean',
        description: 'Enable database level field encryption',
      },
      {
        systemGroup: 'FRONTEND',
        systemKey: 'PAGE_RECORD_DEFAULT',
        systemValue: '20',
        systemType: 'number',
        description: 'Default number of records per page in data tables',
      },
      {
        systemGroup: 'FRONTEND',
        systemKey: 'SHOW_TENANT_NAME',
        systemValue: '1',
        systemType: 'boolean',
        description: 'Toggle to show the tenant/company name in the UI',
      },
      {
        systemGroup: 'FRONTEND',
        systemKey: 'TENANT_NAME_DISPLAY_POSITION',
        systemValue: 'TOP_HEADER_RIGHT',
        systemType: 'string',
        description: 'Position to display the tenant name in the UI',
      }
    ];

    for (const config of defaultConfigs) {
      const exists = await this.systemConfigRepository.findOne({
        where: { systemKey: config.systemKey }
      });
      
      if (!exists) {
        const newConfig = this.systemConfigRepository.create(config);
        await this.systemConfigRepository.save(newConfig);
        this.logger.log(`Seeded default system config: ${config.systemKey}`);
      }
    }
  }

  async findAll(): Promise<SystemConfig[]> {
    return await this.systemConfigRepository.find({
      order: { systemGroup: 'ASC', systemSeqNo: 'ASC', systemKey: 'ASC' },
    });
  }

  async findOne(id: number): Promise<SystemConfig | null> {
    return await this.systemConfigRepository.findOne({ where: { systemId: id } });
  }

  async findByKey(key: string): Promise<SystemConfig | null> {
    return await this.systemConfigRepository.findOne({ where: { systemKey: key, isActive: true } });
  }

  async create(createDto: CreateSystemConfigDto, user: any): Promise<SystemConfig> {
    const config = this.systemConfigRepository.create({
      ...createDto,
      createBy: user?.email || 'system',
    });
    return await this.systemConfigRepository.save(config);
  }

  async update(id: number, updateDto: UpdateSystemConfigDto, user: any): Promise<SystemConfig | null> {
    await this.systemConfigRepository.update(id, {
      ...updateDto,
      updateBy: user?.email || 'system',
    });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.systemConfigRepository.delete(id);
  }
}
