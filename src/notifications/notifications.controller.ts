import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { BasePaginationQueryDto } from '../common/dto/base-query.dto';
import { extractPaginationOptions } from '../common/helpers/query-options.helper';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'notifications', version: '1' })
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get my notifications (paginated)' })
  async getMyNotifications(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: BasePaginationQueryDto,
  ) {
    const result = await this.service.getUserNotifications(
      user.id,
      extractPaginationOptions(query),
    );
    return createPaginatedResponse(
      'Notifications fetched successfully',
      result.items,
      result.meta,
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async getUnreadCount(@CurrentUser() user: JwtPayloadType) {
    const count = await this.service.getUnreadCount(user.id);
    return createResponse('Unread count fetched', { count });
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markAsRead(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.service.markAsRead(id, user.id);
    return createResponse('Notification marked as read', null);
  }

  @Patch('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllAsRead(@CurrentUser() user: JwtPayloadType) {
    await this.service.markAllAsRead(user.id);
    return createResponse('All notifications marked as read', null);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  async deleteNotification(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    await this.service.deleteNotification(id, user.id);
    return createResponse('Notification deleted', null);
  }
}
