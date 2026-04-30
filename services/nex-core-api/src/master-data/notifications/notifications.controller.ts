import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditLog } from '../../common/decorators/audit-log.decorator';

@ApiTags('notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Return all notifications.' })
  @AuditLog('Notifications', 'Get All Notifications')
  getAllNotifications(): Promise<Notification[]> {
    return this.notificationsService.getAllNotifications();
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get recent notifications' })
  @ApiResponse({ status: 200, description: 'Return recent notifications.' })
  @AuditLog('Notifications', 'Get Recent Notifications')
  getRecentNotifications(@Query('limit') limit?: number): Promise<Notification[]> {
    return this.notificationsService.getRecentNotifications(limit ? Number(limit) : 10);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Return statistics for dashboard.' })
  @AuditLog('Notifications', 'Get Notification Stats')
  getNotificationStats(): Promise<any> {
    return this.notificationsService.getNotificationStats();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'The notification has been successfully created.' })
  @AuditLog('Notifications', 'Create Notification')
  createNotification(@Body() createNotificationDto: Partial<Notification>): Promise<Notification> {
    return this.notificationsService.createNotification(createNotificationDto);
  }
}
