import { Injectable } from '@nestjs/common';
import { NotificationsRepository } from './infrastructure/persistence/notifications.repository';
import { Notification } from './domain/notification';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationType } from './enums/notification-type.enum';
import { IPaginationOptions } from '../common/types/pagination-options';
import { PaginationMetaDto } from '../common/dto/pagination-response.dto';
import { NotificationGateway } from './notification.gateway';
import { NotificationTemplateRegistry } from './notification-template.registry';
import { NotificationEvent } from './notification-events';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly repository: NotificationsRepository,
    private readonly gateway: NotificationGateway,
    private readonly templates: NotificationTemplateRegistry,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<Notification> {
    const notification = await this.repository.create({
      recipientId: dto.recipientId,
      triggeredById: dto.triggeredById ?? null,
      type: dto.type,
      title: dto.title,
      message: dto.message,
      entityType: dto.entityType ?? null,
      entityId: dto.entityId ?? null,
      redirectUrl: dto.redirectUrl ?? null,
      isRead: false,
      readAt: null,
      metadata: dto.metadata ?? null,
    });
    this.gateway.emitCreated(notification);
    this.gateway.emitUnreadCount(
      notification.recipientId,
      await this.repository.countUnread(notification.recipientId),
    );
    return notification;
  }

  async createBulkNotifications(dtos: CreateNotificationDto[]): Promise<void> {
    if (!dtos.length) return;
    await Promise.all(dtos.map((dto) => this.createNotification(dto)));
  }

  async publish(event: NotificationEvent): Promise<void> {
    const recipients = [...new Set(event.recipientIds)].filter(
      (recipientId) => recipientId !== event.actorId,
    );
    if (!recipients.length) return;

    const template = this.templates.render(event);
    await this.createBulkNotifications(
      recipients.map((recipientId) => ({
        recipientId,
        triggeredById: event.actorId ?? null,
        type: event.type,
        title: template.title,
        message: template.message,
        entityType: event.resource?.type ?? null,
        entityId: event.resource?.id ?? null,
        redirectUrl: event.redirectUrl ?? null,
        metadata: event.context,
      })),
    );
  }

  async getUserNotifications(
    userId: string,
    paginationOptions: IPaginationOptions,
  ): Promise<{ items: Notification[]; meta: PaginationMetaDto }> {
    return this.repository.findByUser(userId, paginationOptions);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.repository.countUnread(userId);
  }

  async markAsRead(id: string, userId: string): Promise<void> {
    await this.repository.markAsRead(id, userId);
    this.gateway.emitUnreadCount(userId, await this.repository.countUnread(userId));
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.repository.markAllAsRead(userId);
    this.gateway.emitUnreadCount(userId, 0);
  }

  async deleteNotification(id: string, userId: string): Promise<void> {
    await this.repository.deleteByIdAndUser(id, userId);
    this.gateway.emitUnreadCount(userId, await this.repository.countUnread(userId));
  }

  // ── Convenience builders used by other modules ──────────────────────────

  async notifyTaskAssigned(opts: {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    assignedById: string;
    projectId?: string;
    projectName?: string;
    actorName?: string;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.TASK_ASSIGNED,
      recipientIds: [opts.assigneeId],
      actorId: opts.assignedById,
      resource: { type: 'task', id: opts.taskId },
      redirectUrl: opts.projectId
        ? `/projects/${opts.projectId}/tasks?task=${opts.taskId}`
        : `/tasks?task=${opts.taskId}`,
      context: {
        taskTitle: opts.taskTitle,
        projectName: opts.projectName ?? '',
        actorName: opts.actorName ?? '',
      },
    });
  }

  async notifyTaskReassigned(opts: {
    taskId: string;
    taskTitle: string;
    assigneeId: string;
    assignedById: string;
    projectId?: string;
    projectName?: string;
    actorName?: string;
    previousAssigneeId?: string | null;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.TASK_REASSIGNED,
      recipientIds: [opts.assigneeId],
      actorId: opts.assignedById,
      resource: { type: 'task', id: opts.taskId },
      redirectUrl: opts.projectId
        ? `/projects/${opts.projectId}/tasks?task=${opts.taskId}`
        : `/tasks?task=${opts.taskId}`,
      context: {
        taskTitle: opts.taskTitle,
        projectName: opts.projectName ?? '',
        actorName: opts.actorName ?? '',
        previousAssigneeId: opts.previousAssigneeId ?? null,
      },
    });
  }

  private buildCommentRedirectUrl(
    entityType: string,
    entityId: string,
    commentId: string,
  ): string {
    switch (entityType) {
      case 'task':
        return `/tasks?task=${entityId}&comment=${commentId}`;
      case 'subtask':
        return `/tasks?subtask=${entityId}&comment=${commentId}`;
      case 'milestone':
        return `/milestones?milestone=${entityId}&comment=${commentId}`;
      default:
        return `/${entityType}s?task=${entityId}&comment=${commentId}`;
    }
  }

  async notifyCommentMentions(opts: {
    mentionedUserIds: string[];
    authorId: string;
    entityType: string;
    entityId: string;
    commentId: string;
    actorName?: string;
  }): Promise<void> {
    const recipients = opts.mentionedUserIds.filter((id) => id !== opts.authorId);
    if (!recipients.length) return;

    await this.publish({
      type: NotificationType.COMMENT_MENTION,
      recipientIds: recipients,
      actorId: opts.authorId,
      resource: { type: opts.entityType, id: opts.entityId },
      redirectUrl: this.buildCommentRedirectUrl(opts.entityType, opts.entityId, opts.commentId),
      context: {
        entityType: opts.entityType,
        commentId: opts.commentId,
        actorName: opts.actorName ?? '',
      },
    });
  }

  async notifyCommentReply(opts: {
    parentAuthorId: string;
    replyAuthorId: string;
    entityType: string;
    entityId: string;
    commentId: string;
    actorName?: string;
  }): Promise<void> {
    if (opts.parentAuthorId === opts.replyAuthorId) return;
    await this.publish({
      type: NotificationType.COMMENT_REPLY,
      recipientIds: [opts.parentAuthorId],
      actorId: opts.replyAuthorId,
      resource: { type: opts.entityType, id: opts.entityId },
      redirectUrl: this.buildCommentRedirectUrl(opts.entityType, opts.entityId, opts.commentId),
      context: {
        entityType: opts.entityType,
        commentId: opts.commentId,
        actorName: opts.actorName ?? '',
      },
    });
  }

  async notifyTeamMemberAdded(opts: {
    teamId: string;
    teamName: string;
    memberId: string;
    addedById: string;
    projectId?: string;
    projectName?: string;
    actorName?: string;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.TEAM_MEMBER_ADDED,
      recipientIds: [opts.memberId],
      actorId: opts.addedById,
      resource: { type: 'team', id: opts.teamId },
      redirectUrl: `/teams?team=${opts.teamId}`,
      context: {
        teamName: opts.teamName,
        projectName: opts.projectName,
        projectId: opts.projectId,
        actorName: opts.actorName,
        assignedAt: new Date().toISOString(),
      },
    });
  }

  async notifyProjectAssigned(opts: {
    projectId: string;
    projectName: string;
    teamId: string;
    teamName: string;
    memberIds: string[];
    assignedById: string;
    actorName?: string;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.PROJECT_ASSIGNED,
      recipientIds: opts.memberIds,
      actorId: opts.assignedById,
      resource: { type: 'project', id: opts.projectId },
      redirectUrl: `/projects/${opts.projectId}/tasks`,
      context: {
        projectName: opts.projectName,
        teamName: opts.teamName,
        teamId: opts.teamId,
        actorName: opts.actorName,
        assignedAt: new Date().toISOString(),
      },
    });
  }

  async notifyTeamMemberRemoved(opts: {
    teamId: string;
    teamName: string;
    memberId: string;
    removedById: string;
    actorName?: string;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.TEAM_MEMBER_REMOVED,
      recipientIds: [opts.memberId],
      actorId: opts.removedById,
      resource: { type: 'team', id: opts.teamId },
      redirectUrl: '/teams',
      context: {
        teamName: opts.teamName,
        actorName: opts.actorName,
        removedAt: new Date().toISOString(),
      },
    });
  }

  async notifyTeamMemberTransferred(opts: {
    fromTeamId: string;
    fromTeamName: string;
    toTeamId: string;
    toTeamName: string;
    memberId: string;
    transferredById: string;
    actorName?: string;
  }): Promise<void> {
    await this.publish({
      type: NotificationType.TEAM_MEMBER_TRANSFERRED,
      recipientIds: [opts.memberId],
      actorId: opts.transferredById,
      resource: { type: 'team', id: opts.toTeamId },
      redirectUrl: `/teams?team=${opts.toTeamId}`,
      context: {
        fromTeamId: opts.fromTeamId,
        fromTeamName: opts.fromTeamName,
        toTeamName: opts.toTeamName,
        actorName: opts.actorName,
        transferredAt: new Date().toISOString(),
      },
    });
  }

  async notifyTaskStatusChanged(opts: {
    taskId: string;
    taskTitle: string;
    newStatus: string;
    reporterId: string;
    assigneeId?: string | null;
    changedById: string;
    previousStatus?: string;
  }): Promise<void> {
    const isCompleted = opts.newStatus === 'DONE';
    const isBlocked = opts.newStatus === 'BLOCKED';
    await this.publish({
      type: isCompleted
        ? NotificationType.TASK_COMPLETED
        : isBlocked
          ? NotificationType.TASK_BLOCKED
          : NotificationType.TASK_STATUS_CHANGED,
      recipientIds: [
        opts.reporterId,
        ...(opts.assigneeId ? [opts.assigneeId] : []),
      ],
      actorId: opts.changedById,
      resource: { type: 'task', id: opts.taskId },
      redirectUrl: `/tasks?task=${opts.taskId}`,
      context: {
        taskTitle: opts.taskTitle,
        newStatus: opts.newStatus,
        previousStatus: opts.previousStatus ?? '',
      },
    });
  }
}
