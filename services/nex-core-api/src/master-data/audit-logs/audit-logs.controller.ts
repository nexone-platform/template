import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('Audit Logs')
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all audit logs' })
  @AuditLog('Audit Logs', 'Get All Logs')
  getAllLogs() {
    return this.auditLogsService.getAllLogs();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent audit logs' })
  @AuditLog('Audit Logs', 'Get Recent Logs')
  getRecentLogs(@Query('limit') limit: number) {
    const defaultLimit = limit ? Number(limit) : 5;
    return this.auditLogsService.getRecentLogs(defaultLimit);
  }
}
