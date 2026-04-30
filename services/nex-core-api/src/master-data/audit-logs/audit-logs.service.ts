import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditLogsService {
  constructor(
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
  ) {}

  async getRecentLogs(limit: number = 5): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { created_at: 'DESC' },
      take: limit,
    });
  }

  async getAllLogs(): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      order: { created_at: 'DESC' },
    });
  }

  async createLog(data: Partial<AuditLog>): Promise<AuditLog> {
    const newLog = this.auditLogRepository.create(data);
    return this.auditLogRepository.save(newLog);
  }
}
