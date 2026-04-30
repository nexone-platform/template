import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AuditLog } from './common/decorators/audit-log.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @AuditLog('App', 'Get Hello')
  getHello(): string {
    return this.appService.getHello();
  }
}
