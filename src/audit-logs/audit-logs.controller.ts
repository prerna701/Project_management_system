import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { createPaginatedResponse } from '../common/utils/base-response';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

class AuditLogQueryDto {
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 20;
}

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Audit Logs')
@Controller({ path: 'audit-logs', version: '1' })
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query() query: AuditLogQueryDto) {
    const { items, total } = await this.auditLogsService.findAll(query.page, query.limit);
    const limit = query.limit ?? 20;
    const page = query.page ?? 1;
    return createPaginatedResponse('Audit logs fetched successfully', items, {
      currentPage: page,
      limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    });
  }
}
