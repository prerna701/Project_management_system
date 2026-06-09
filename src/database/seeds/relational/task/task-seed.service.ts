import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { TaskEntity } from 'src/tasks/infrastructure/persistence/relational/entities/task.entity';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';
import { TaskPriority } from 'src/tasks/enums/task-priority.enum';

interface TaskData {
  projectId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedHours: number;
  subtasks: Array<{
    title: string;
    description: string;
    priority: TaskPriority;
    status: TaskStatus;
    estimatedHours: number;
  }>;
}

@Injectable()
export class TaskSeedService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
  ) {}

  async run(projectIds: string[]): Promise<void> {
    for (const projectId of projectIds) {
      const tasks = this.generateTasks(projectId);

      for (const task of tasks) {
        const existing = await this.taskRepo.findOne({
          where: {
            projectId,
            title: task.title,
            parentTaskId: IsNull(), // Only check parent tasks
          },
        });

        if (!existing) {
          // Create parent task
          const parentTask = await this.taskRepo.save(
            this.taskRepo.create({
              projectId,
              title: task.title,
              description: task.description,
              priority: task.priority,
              status: task.status,
              estimatedHours: task.estimatedHours,
              isBillable: true,
              labels: ['parent-task'],
            }),
          );

          // Create subtasks
          for (const subtask of task.subtasks) {
            await this.taskRepo.save(
              this.taskRepo.create({
                projectId,
                parentTaskId: parentTask.id,
                title: subtask.title,
                description: subtask.description,
                priority: subtask.priority,
                status: subtask.status,
                estimatedHours: subtask.estimatedHours,
                isBillable: true,
                labels: ['sub-task'],
              }),
            );
          }
        }
      }
    }
  }

  private generateTasks(projectId: string): TaskData[] {
    const now = new Date();
    const startDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    return [
      {
        projectId,
        title: 'Task 1: Core Development',
        description: 'Main development task for core features',
        priority: TaskPriority.HIGH,
        status: TaskStatus.OPEN,
        estimatedHours: 40,
        subtasks: [
          {
            title: 'Subtask 1.1: Setup Development Environment',
            description: 'Setup and configure development environment',
            priority: TaskPriority.HIGH,
            status: TaskStatus.OPEN,
            estimatedHours: 8,
          },
          {
            title: 'Subtask 1.2: Implement Core Features',
            description: 'Implement all core features',
            priority: TaskPriority.HIGH,
            status: TaskStatus.OPEN,
            estimatedHours: 20,
          },
          {
            title: 'Subtask 1.3: Unit Testing',
            description: 'Write and execute unit tests',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.OPEN,
            estimatedHours: 12,
          },
        ],
      },
      {
        projectId,
        title: 'Task 2: Integration & Deployment',
        description: 'Integration testing and deployment setup',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.OPEN,
        estimatedHours: 30,
        subtasks: [
          {
            title: 'Subtask 2.1: API Integration',
            description: 'Integrate with external APIs',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.OPEN,
            estimatedHours: 10,
          },
          {
            title: 'Subtask 2.2: Integration Testing',
            description: 'Perform comprehensive integration tests',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.OPEN,
            estimatedHours: 12,
          },
          {
            title: 'Subtask 2.3: Deployment Preparation',
            description: 'Prepare deployment scripts and documentation',
            priority: TaskPriority.LOW,
            status: TaskStatus.OPEN,
            estimatedHours: 8,
          },
        ],
      },
    ];
  }
}
