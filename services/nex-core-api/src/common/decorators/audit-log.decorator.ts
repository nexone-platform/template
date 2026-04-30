import { SetMetadata } from '@nestjs/common';

export const AuditLog = (module: string, action: string) => SetMetadata('audit_log', { module, action });
