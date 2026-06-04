import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority } from '../../tasks/enums/task-priority.enum';
import { TaskStatus } from '../../tasks/enums/task-status.enum';
import { TaskBillingType } from '../../tasks/enums/task-billing-type.enum';

export class Subtask {
  @ApiProperty({ type: String })
  id: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  taskId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description: string | null;

  @ApiPropertyOptional()
  notes: string | null;

  @ApiPropertyOptional()
  assigneeId: string | null;

  @ApiPropertyOptional()
  ownerId: string | null;

  @ApiPropertyOptional()
  createdBy: string | null;

  @ApiProperty({ enum: TaskPriority })
  priority: TaskPriority;

  @ApiProperty({ enum: TaskStatus })
  status: TaskStatus;

  @ApiPropertyOptional()
  startDate: Date | null;

  @ApiPropertyOptional()
  dueDate: Date | null;

  @ApiPropertyOptional()
  workHours: number | null;

  @ApiProperty()
  loggedHours: number;

  @ApiProperty()
  completionPercentage: number;

  @ApiProperty()
  isBillable: boolean;

  @ApiProperty({ enum: TaskBillingType })
  billingType: TaskBillingType;

  @ApiPropertyOptional({ type: [String] })
  dependencies: string[];

  @ApiPropertyOptional({ type: [String] })
  attachments: string[];

  @ApiPropertyOptional({ type: [String] })
  labels: string[];

  @ApiPropertyOptional({ type: [String] })
  checklist: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiPropertyOptional()
  deletedAt: Date | null;
}
