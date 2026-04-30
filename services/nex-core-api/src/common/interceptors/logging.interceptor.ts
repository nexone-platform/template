import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogsService } from '../../master-data/audit-logs/audit-logs.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const startTime = Date.now();

    const auditMeta = this.reflector.get<{ module: string; action: string }>(
      'audit_log',
      context.getHandler(),
    );

    return next.handle().pipe(
      tap(() => {
        if (auditMeta) {
          const responseTime = Date.now() - startTime;

          // ── WHO ──
          const userId = req.user?.id || null;
          const userName = req.user?.username || req.user?.email || 'unknown';
          const roleName = req.user?.role || 'Guest';

          // ── WHERE ──
          const ipAddress =
            req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.ip ||
            'unknown';
          const cleanIp = (typeof ipAddress === 'string' ? ipAddress.split(',')[0] : ipAddress[0])?.trim();

          this.auditLogsService.createLog({
            // WHAT
            action: auditMeta.action.toUpperCase().replace(/\s+/g, '_'),
            title: `${auditMeta.module} - ${auditMeta.action}`,
            description: `${userName} performed ${auditMeta.action} on ${auditMeta.module} via ${req.method} ${req.originalUrl}`,
            module: auditMeta.module,
            // WHO
            user_id: userId,
            user_name: userName,
            role_name: roleName,
            // WHERE
            ip_address: cleanIp?.substring(0, 45),
            endpoint: `${req.method} ${req.originalUrl}`.substring(0, 255),
            user_agent: req.headers['user-agent']?.substring(0, 500),
            // HOW
            payload: req.body && Object.keys(req.body).length > 0 ? req.body : null,
            response_time_ms: responseTime,
            // WHY
            status: 'SUCCESS',
          }).catch(err => console.error('Failed to write audit log:', err));
        }
      }),
      catchError((error) => {
        if (auditMeta) {
          const responseTime = Date.now() - startTime;
          const userId = req.user?.id || null;
          const userName = req.user?.username || req.user?.email || 'unknown';
          const roleName = req.user?.role || 'Guest';
          const ipAddress =
            req.headers['x-forwarded-for'] ||
            req.connection?.remoteAddress ||
            req.ip ||
            'unknown';
          const cleanIp = (typeof ipAddress === 'string' ? ipAddress.split(',')[0] : ipAddress[0])?.trim();

          this.auditLogsService.createLog({
            // WHAT
            action: auditMeta.action.toUpperCase().replace(/\s+/g, '_'),
            title: `${auditMeta.module} - ${auditMeta.action} (Failed)`,
            description: `${userName} attempted ${auditMeta.action} on ${auditMeta.module} via ${req.method} ${req.originalUrl} — Error: ${error.message}`,
            module: auditMeta.module,
            // WHO
            user_id: userId,
            user_name: userName,
            role_name: roleName,
            // WHERE
            ip_address: cleanIp?.substring(0, 45),
            endpoint: `${req.method} ${req.originalUrl}`.substring(0, 255),
            user_agent: req.headers['user-agent']?.substring(0, 500),
            // HOW
            payload: req.body && Object.keys(req.body).length > 0 ? req.body : null,
            response_time_ms: responseTime,
            // WHY
            status: 'FAILED',
            error_message: (error.message || String(error)).substring(0, 2000),
          }).catch(err => console.error('Failed to write audit error log:', err));
        }
        throw error;
      }),
    );
  }
}
