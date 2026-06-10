import { Injectable } from '@nestjs/common';
import {
  NotificationEvent,
  NotificationTemplate,
} from './notification-events';
import { NotificationType } from './enums/notification-type.enum';

@Injectable()
export class NotificationTemplateRegistry {
  render(event: NotificationEvent): NotificationTemplate {
    const value = (key: string, fallback: string) =>
      String(event.context[key] ?? fallback);

    switch (event.type) {
      case NotificationType.TEAM_MEMBER_ADDED: {
        const teamName = value('teamName', 'a team');
        const projectName = event.context.projectName
          ? ` under project ${value('projectName', '')}`
          : '';
        const actorName = event.context.actorName
          ? ` by ${value('actorName', '')}`
          : '';
        return {
          title: 'You were added to a team',
          message: `You have been assigned to ${teamName}${projectName}${actorName}.`,
        };
      }
      case NotificationType.PROJECT_ASSIGNED:
        return {
          title: 'Project assigned to your team',
          message: `Your team ${value('teamName', '')} has been assigned to project ${value('projectName', '')} by ${value('actorName', 'a manager')}.`,
        };
      case NotificationType.TEAM_MEMBER_REMOVED:
        return {
          title: 'You were removed from a team',
          message: `You are no longer an active member of ${value('teamName', 'the team')}.`,
        };
      case NotificationType.TEAM_MEMBER_TRANSFERRED:
        return {
          title: 'You were transferred to another team',
          message: `You have been transferred from ${value('fromTeamName', 'your previous team')} to ${value('toTeamName', 'a new team')} by ${value('actorName', 'a manager')}.`,
        };
      case NotificationType.TASK_ASSIGNED:
        return {
          title: 'Task assigned to you',
          message: `You have been assigned task ${value('taskTitle', '')} in project ${value('projectName', '')} by ${value('actorName', 'a manager')}.`,
        };
      case NotificationType.TASK_REASSIGNED:
        return {
          title: 'Task reassigned to you',
          message: `Task ${value('taskTitle', '')} in project ${value('projectName', '')} was reassigned to you by ${value('actorName', 'a manager')}.`,
        };
      case NotificationType.TASK_COMPLETED:
        return {
          title: 'Task marked as completed',
          message: `${value('taskTitle', 'A task')} has been marked as done.`,
        };
      case NotificationType.TASK_BLOCKED:
        return {
          title: 'Task is blocked',
          message: `${value('taskTitle', 'A task')} has been marked as blocked.`,
        };
      case NotificationType.TASK_STATUS_CHANGED:
        return {
          title: 'Task status updated',
          message: `${value('taskTitle', 'A task')} changed from ${value('previousStatus', '')} to ${value('newStatus', '')}.`,
        };
      case NotificationType.COMMENT_MENTION: {
        const mentionActor = event.context.actorName
          ? value('actorName', '')
          : 'Someone';
        return {
          title: 'You were mentioned in a comment',
          message: `${mentionActor} mentioned you in a ${value('entityType', '')} comment.`,
        };
      }
      case NotificationType.COMMENT_REPLY: {
        const replyActor = event.context.actorName
          ? value('actorName', '')
          : 'Someone';
        return {
          title: 'New reply on your comment',
          message: `${replyActor} replied to your ${value('entityType', '')} comment.`,
        };
      }
      case NotificationType.TIMESHEET_APPROVED:
        return {
          title: 'Time log approved',
          message: `Your ${value('duration', '')} time log for ${value('taskTitle', 'the task')} was approved.`,
        };
      case NotificationType.TIMESHEET_REJECTED:
        return {
          title: 'Time log needs correction',
          message: `Your time log for ${value('taskTitle', 'the task')} was rejected: ${value('rejectionReason', 'Please review and correct the entry.')}`,
        };
      default:
        return {
          title: value('title', 'Notification'),
          message: value('message', ''),
        };
    }
  }
}
