import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { ChatMessageDto } from './dto/chat-message.dto';
import { TasksService } from '../tasks/tasks.service';
import { MilestonesService } from '../milestones/milestones.service';
import { SprintsService } from '../sprints/sprints.service';
import { ProjectsRepository } from '../projects/infrastructure/persistence/projects.repository';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { defineAbilitiesFor } from '../auth/abilities';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { TaskStatus } from '../tasks/enums/task-status.enum';

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'list_projects',
      description: 'List all projects accessible to the current user',
      parameters: { type: 'object', properties: {}, required: [] },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_task',
      description:
        'Create a new task in a project. Call list_projects first to resolve a project name to its ID.',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project UUID' },
          title: { type: 'string', description: 'Task title' },
          description: { type: 'string', description: 'Task description (optional)' },
          assigneeId: { type: 'string', description: 'Assignee user UUID (optional)' },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
            description: 'Task priority (default MEDIUM)',
          },
          status: {
            type: 'string',
            enum: ['OPEN', 'IN_PROGRESS', 'REVIEW', 'TESTING', 'DONE', 'BLOCKED'],
            description: 'Task status (default OPEN)',
          },
          dueDate: { type: 'string', description: 'Due date ISO string (optional)' },
          milestoneId: { type: 'string', description: 'Milestone UUID (optional)' },
          sprintId: { type: 'string', description: 'Sprint UUID (optional)' },
        },
        required: ['projectId', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_subtask',
      description: 'Create a subtask under an existing parent task. You MUST call create_task first and use the returned task_uuid as parentTaskId — never use a task title or any invented string.',
      parameters: {
        type: 'object',
        properties: {
          parentTaskId: { type: 'string', description: 'The task_uuid returned by create_task. Must be a real UUID, never a task title.' },
          projectId: { type: 'string', description: 'Project UUID' },
          title: { type: 'string', description: 'Subtask title' },
          description: { type: 'string', description: 'Description (optional)' },
          assigneeId: { type: 'string', description: 'Assignee UUID (optional)' },
          priority: {
            type: 'string',
            enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
          },
        },
        required: ['parentTaskId', 'projectId', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_milestone',
      description: 'Create a milestone in a project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project UUID' },
          name: { type: 'string', description: 'Milestone name' },
          description: { type: 'string', description: 'Description (optional)' },
          dueDate: { type: 'string', description: 'Due date ISO string (optional)' },
        },
        required: ['projectId', 'name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_sprint',
      description: 'Create a sprint in a project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project UUID' },
          name: { type: 'string', description: 'Sprint name' },
          goal: { type: 'string', description: 'Sprint goal (optional)' },
          startDate: { type: 'string', description: 'Start date ISO string (optional)' },
          endDate: { type: 'string', description: 'End date ISO string (optional)' },
        },
        required: ['projectId', 'name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_sprints',
      description: 'List sprints in a project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project UUID' },
        },
        required: ['projectId'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'list_milestones',
      description: 'List milestones in a project',
      parameters: {
        type: 'object',
        properties: {
          projectId: { type: 'string', description: 'Project UUID' },
        },
        required: ['projectId'],
      },
    },
  },
];

@Injectable()
export class ChatbotService {
  private readonly logger = new Logger(ChatbotService.name);
  private readonly client: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    private readonly tasksService: TasksService,
    private readonly milestonesService: MilestonesService,
    private readonly sprintsService: SprintsService,
    private readonly projectsRepository: ProjectsRepository,
    private readonly userRepository: UserRepository,
  ) {
    this.client = new OpenAI({
      apiKey: this.configService.get<string>('GROQ_API_KEY') ?? '',
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async chat(
    dto: ChatMessageDto,
    user: JwtPayloadType,
  ): Promise<{ reply: string; actions: any[] }> {
    const ability = await this.buildAbility(user);
    const actions: any[] = [];

    // Pre-fetch projects so the model always has real IDs — never invents placeholders
    const projectsResult = await this.toolListProjects(user);
    const projectsContext = projectsResult.projects?.length
      ? `The user's accessible projects are:\n${projectsResult.projects.map((p: any) => `  - "${p.name}" (id: ${p.id})`).join('\n')}`
      : 'The user has no accessible projects.';

    const systemMessage: OpenAI.Chat.ChatCompletionSystemMessageParam = {
      role: 'system',
      content: `You are a helpful project management assistant for a software team.
You can create tasks, subtasks, milestones, and sprints using the provided functions.

CRITICAL RULES — follow these exactly:
1. NEVER invent or guess a project ID. Only use the real project IDs listed below.
2. When the user names a project, match it to the list below and use that exact id.
3. You MUST call list_projects if you ever need a project ID that is not in the list below.
4. NEVER use placeholder text like "project_id_goes_here" — always substitute the real UUID.
5. Always confirm what was created including its title/name.
6. If a user lacks permission for an action, politely explain.
7. When creating subtasks: the parentTaskId MUST be the task_uuid returned by create_task — NEVER use the task title or any other string as parentTaskId.
8. When creating multiple items in sequence (tasks then subtasks), always wait for each tool result and use the returned task_uuid for the next call.

${projectsContext}

Today's date is ${new Date().toISOString().split('T')[0]}.`,
    };

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      systemMessage,
      ...(dto.history ?? []).map((h) => ({
        role: (h.role === 'model' ? 'assistant' : h.role) as 'user' | 'assistant',
        content: h.text,
      })),
      { role: 'user', content: dto.message },
    ];

    try {
      // Agentic loop: keep calling until no more tool calls
      for (let round = 0; round < 5; round++) {
        const completion = await this.client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages,
          tools: TOOLS,
          tool_choice: 'auto',
        });

        const choice = completion.choices[0];
        const assistantMsg = choice.message;
        messages.push(assistantMsg);

        if (!assistantMsg.tool_calls?.length) {
          // Final text response
          return { reply: assistantMsg.content ?? "I've processed your request.", actions };
        }

        // Execute all tool calls in this round
        for (const call of assistantMsg.tool_calls) {
          const fn = (call as any).function as { name: string; arguments: string };
          let args: Record<string, any> = {};
          try {
            args = JSON.parse(fn.arguments);
          } catch { /* invalid JSON args */ }

          const result = await this.executeTool(
            fn.name,
            args,
            user,
            ability,
            actions,
          );

          messages.push({
            role: 'tool',
            tool_call_id: call.id,
            content: JSON.stringify(result),
          });
        }
      }

      return { reply: "I've processed your request.", actions };
    } catch (error: any) {
      const msg: string = error?.message ?? String(error);
      const status: number | undefined = error?.status ?? error?.response?.status;
      this.logger.error(`Grok API error [status=${status}]: ${msg}`);

      if (status === 401 || msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Invalid API key')) {
        return {
          reply: 'AI assistant configuration error: invalid API key. Please check GROK_API_KEY in the .env file.',
          actions,
        };
      }
      if (status === 404 || msg.includes('404') || msg.includes('model') || msg.includes('not found')) {
        return {
          reply: `AI model not found. Check the xAI model name. Details: ${msg}`,
          actions,
        };
      }
      if (status === 429 || msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
        return {
          reply: "I'm temporarily unavailable due to API rate limits. Please try again in a moment.",
          actions,
        };
      }
      return {
        reply: `Sorry, I encountered an error: ${msg}`,
        actions,
      };
    }
  }

  private isValidUuid(value: unknown): boolean {
    return (
      typeof value === 'string' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
    );
  }

  private async executeTool(
    name: string,
    args: Record<string, any>,
    user: JwtPayloadType,
    ability: ReturnType<typeof defineAbilitiesFor>,
    actions: any[],
  ): Promise<Record<string, any>> {
    try {
      switch (name) {
        case 'list_projects':
          return this.toolListProjects(user);

        case 'create_task':
          if (!ability.can('add', 'tasks')) {
            return { error: 'You do not have permission to create tasks.' };
          }
          if (!this.isValidUuid(args['projectId'])) {
            return { error: `projectId "${args['projectId']}" is not a valid UUID. Use the project id from the projects list, never a project name.` };
          }
          return this.toolCreateTask(args, user, actions);

        case 'create_subtask':
          if (!ability.can('add', 'subtasks') && !ability.can('add', 'tasks')) {
            return { error: 'You do not have permission to create subtasks.' };
          }
          if (!this.isValidUuid(args['parentTaskId'])) {
            return { error: `parentTaskId "${args['parentTaskId']}" is not a valid UUID. You must use the task_uuid returned by create_task, not the task title.` };
          }
          if (!this.isValidUuid(args['projectId'])) {
            return { error: `projectId "${args['projectId']}" is not a valid UUID. Use the project id from the projects list.` };
          }
          return this.toolCreateSubtask(args, user, actions);

        case 'create_milestone':
          if (!ability.can('add', 'milestones')) {
            return { error: 'You do not have permission to create milestones.' };
          }
          if (!this.isValidUuid(args['projectId'])) {
            return { error: `projectId "${args['projectId']}" is not a valid UUID. Use the project id from the projects list.` };
          }
          return this.toolCreateMilestone(args, actions);

        case 'create_sprint':
          if (!ability.can('add', 'sprints')) {
            return { error: 'You do not have permission to create sprints.' };
          }
          if (!this.isValidUuid(args['projectId'])) {
            return { error: `projectId "${args['projectId']}" is not a valid UUID. Use the project id from the projects list.` };
          }
          return this.toolCreateSprint(args, actions);

        case 'list_sprints':
          return this.toolListSprints(args['projectId'] as string);

        case 'list_milestones':
          return this.toolListMilestones(args['projectId'] as string);

        default:
          return { error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      this.logger.error(`Tool ${name} failed`, error);
      return {
        error: error instanceof Error ? error.message : 'Tool execution failed',
      };
    }
  }

  private async toolListProjects(user: JwtPayloadType): Promise<Record<string, any>> {
    const projects = await this.projectsRepository.findProjectsByUserId(user.id);
    return {
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        code: p.code,
        status: p.status,
      })),
    };
  }

  private async toolCreateTask(
    args: Record<string, any>,
    user: JwtPayloadType,
    actions: any[],
  ): Promise<Record<string, any>> {
    const task = await this.tasksService.createForProject(
      args['projectId'] as string,
      {
        title: args['title'] as string,
        description: (args['description'] as string) ?? undefined,
        assigneeId: (args['assigneeId'] as string) ?? undefined,
        priority: (args['priority'] as TaskPriority) ?? TaskPriority.MEDIUM,
        status: (args['status'] as TaskStatus) ?? TaskStatus.OPEN,
        dueDate: (args['dueDate'] as string) ?? undefined,
        milestoneId: (args['milestoneId'] as string) ?? undefined,
        sprintId: (args['sprintId'] as string) ?? undefined,
      } as any,
      user,
    );
    actions.push({ type: 'TASK_CREATED', data: { id: task.id, title: task.title } });
    return {
      task_uuid: task.id,
      title: task.title,
      status: task.status,
      message: `Task created successfully. IMPORTANT: Use task_uuid="${task.id}" as parentTaskId when creating subtasks for this task.`,
    };
  }

  private async toolCreateSubtask(
    args: Record<string, any>,
    user: JwtPayloadType,
    actions: any[],
  ): Promise<Record<string, any>> {
    const task = await this.tasksService.createSubtask(
      args['parentTaskId'] as string,
      {
        title: args['title'] as string,
        assigneeId: (args['assigneeId'] as string) ?? undefined,
        priority: (args['priority'] as TaskPriority) ?? undefined,
      } as any,
      user,
    );
    actions.push({ type: 'SUBTASK_CREATED', data: { id: task.id, title: task.title } });
    return { id: task.id, title: task.title, message: 'Subtask created successfully' };
  }

  private async toolCreateMilestone(
    args: Record<string, any>,
    actions: any[],
  ): Promise<Record<string, any>> {
    const milestone = await this.milestonesService.create(args['projectId'] as string, {
      name: args['name'] as string,
      description: (args['description'] as string) ?? undefined,
      dueDate: (args['dueDate'] as string) ?? undefined,
    });
    actions.push({ type: 'MILESTONE_CREATED', data: { id: milestone.id, name: milestone.name } });
    return { id: milestone.id, name: milestone.name, message: 'Milestone created successfully' };
  }

  private async toolCreateSprint(
    args: Record<string, any>,
    actions: any[],
  ): Promise<Record<string, any>> {
    const sprint = await this.sprintsService.create(args['projectId'] as string, {
      name: args['name'] as string,
      goal: (args['goal'] as string) ?? undefined,
      startDate: (args['startDate'] as string) ?? undefined,
      endDate: (args['endDate'] as string) ?? undefined,
    });
    actions.push({ type: 'SPRINT_CREATED', data: { id: sprint.id, name: sprint.name } });
    return { id: sprint.id, name: sprint.name, message: 'Sprint created successfully' };
  }

  private async toolListSprints(projectId: string): Promise<Record<string, any>> {
    const { items } = await this.sprintsService.findByProjectId(projectId);
    return {
      sprints: items.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        startDate: s.startDate,
        endDate: s.endDate,
      })),
    };
  }

  private async toolListMilestones(projectId: string): Promise<Record<string, any>> {
    const { items } = await this.milestonesService.findByProjectId(projectId);
    return {
      milestones: items.map((m) => ({
        id: m.id,
        name: m.name,
        status: m.status,
        dueDate: m.dueDate,
      })),
    };
  }

  private async buildAbility(user: JwtPayloadType) {
    const userRoles = await this.userRepository.getUserRoles(user.id);

    // Mirror the CaslAbilityGuard: merge token role if not already present
    if (user.role && !userRoles.some((r: any) => r.id === user.role?.id)) {
      userRoles.push(user.role);
    }

    const rolesName = userRoles
      .filter(Boolean)
      .map((role: any) => ({ id: role.id, name: role.name }));

    const roleIds = rolesName.map((r: any) => r.id as number);
    const allPermissions = await this.userRepository.getUserPermissions(user.id, roleIds);

    const permissionLabels = allPermissions
      .map((p: any) => p.name as string)
      .filter(Boolean);

    this.logger.debug(
      `[buildAbility] userId=${user.id} roles=${JSON.stringify(rolesName)} roleIds=${JSON.stringify(roleIds)} permissions=${JSON.stringify(permissionLabels)}`,
    );

    const ability = defineAbilitiesFor(user, permissionLabels, rolesName);

    this.logger.debug(
      `[buildAbility] can(add,tasks)=${ability.can('add', 'tasks')} can(manage,all)=${ability.can('manage', 'all')}`,
    );

    return ability;
  }
}
