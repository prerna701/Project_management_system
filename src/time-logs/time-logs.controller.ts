import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import {
  createPaginatedResponse,
  createResponse,
} from '../common/utils/base-response';
import { CreateManualTimeLogDto } from './dto/create-manual-time-log.dto';
import { ReviewTimeLogDto } from './dto/review-time-log.dto';
import { StartTimerDto } from './dto/start-timer.dto';
import { StopTimerDto } from './dto/stop-timer.dto';
import { TimeLogQueryDto } from './dto/time-log-query.dto';
import { UpdateTimeLogDto } from './dto/update-time-log.dto';
import { TimeLogsService } from './time-logs.service';

@ApiTags('Time Logs')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ version: '1' })
export class TimeLogsController {
  constructor(private readonly service: TimeLogsService) {}

  @Post('time-logs/timer/start')
  @SetMetadata('abilities', [['log', 'timesheets']])
  @HttpCode(HttpStatus.CREATED)
  async start(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: StartTimerDto,
  ) {
    return createResponse(
      'Timer started successfully',
      await this.service.startTimer(user, dto),
    );
  }

  @Get('time-logs/timer/active')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async active(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Active timer fetched successfully',
      await this.service.getActiveTimer(user.id),
    );
  }

  @Delete('time-logs/timer/active')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async resetActiveTimer(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Active timer reset successfully',
      await this.service.resetActiveTimer(user.id),
    );
  }

  @Get('time-logs/loggable-options')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async loggableOptions(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Loggable projects and tasks fetched successfully',
      await this.service.getLoggableOptions(user),
    );
  }

  @Patch('time-logs/timer/pause')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async pause(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Timer paused successfully',
      await this.service.pauseTimer(user.id),
    );
  }

  @Patch('time-logs/timer/resume')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async resume(@CurrentUser() user: JwtPayloadType) {
    return createResponse(
      'Timer resumed successfully',
      await this.service.resumeTimer(user.id),
    );
  }

  @Post('time-logs/timer/stop')
  @SetMetadata('abilities', [['log', 'timesheets']])
  async stop(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: StopTimerDto,
  ) {
    return createResponse(
      'Timer stopped successfully',
      await this.service.stopTimer(user.id, dto),
    );
  }

  @Post('time-logs/manual')
  @SetMetadata('abilities', [['log', 'timesheets']])
  @HttpCode(HttpStatus.CREATED)
  async manual(
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: CreateManualTimeLogDto,
  ) {
    return createResponse(
      'Manual time log created successfully',
      await this.service.createManual(user, dto),
    );
  }

  @Patch('time-logs/:id')
  @SetMetadata('abilities', [['edit_own', 'timesheets']])
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: UpdateTimeLogDto,
  ) {
    return createResponse(
      'Time log updated successfully',
      await this.service.updateOwnDraft(id, user.id, dto),
    );
  }

  @Post('time-logs/:id/submit')
  @SetMetadata('abilities', [['submit', 'timesheets']])
  async submit(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return createResponse(
      'Time log submitted successfully',
      await this.service.submit(id, user),
    );
  }

  @Post('time-logs/:id/approve')
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
  ) {
    return createResponse(
      'Time log approved successfully',
      await this.service.approve(id, user),
    );
  }

  @Post('time-logs/:id/reject')
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayloadType,
    @Body() dto: ReviewTimeLogDto,
  ) {
    return createResponse(
      'Time log rejected successfully',
      await this.service.reject(id, user, dto),
    );
  }

  @Get('time-logs/my')
  @SetMetadata('abilities', [['browse', 'timesheets']])
  async mine(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: TimeLogQueryDto,
  ) {
    const { items, meta } = await this.service.listMine(user.id, query);
    return createPaginatedResponse(
      'Time logs fetched successfully',
      items,
      meta,
    );
  }

  @Get('tasks/:taskId/time-logs')
  @SetMetadata('abilities', [['browse', 'timesheets']])
  async taskLogs(
    @Param('taskId') taskId: string,
    @CurrentUser() user: JwtPayloadType,
    @Query() query: TimeLogQueryDto,
  ) {
    const { items, meta } = await this.service.listTask(taskId, user, query);
    return createPaginatedResponse(
      'Task time logs fetched successfully',
      items,
      meta,
    );
  }

  @Get('time-logs/team')
  @SetMetadata('abilities', [['view_team', 'timesheets']])
  async team(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: TimeLogQueryDto,
  ) {
    const { items, meta } = await this.service.listTeam(user, query);
    return createPaginatedResponse(
      'Team time logs fetched successfully',
      items,
      meta,
    );
  }

  @Get('time-logs/reports/summary')
  @SetMetadata('abilities', [['reports', 'timesheets']])
  async report(
    @CurrentUser() user: JwtPayloadType,
    @Query() query: TimeLogQueryDto,
  ) {
    return createResponse(
      'Timesheet report fetched successfully',
      await this.service.report(user, query),
    );
  }
}
