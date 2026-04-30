import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route as publicly accessible (skip AuthGuard).
 * Use only for login, register, and health check endpoints.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
