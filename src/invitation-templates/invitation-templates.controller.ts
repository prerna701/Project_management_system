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
import { InvitationTemplatesService } from './invitation-templates.service';
import { CreateInvitationTemplateDto } from './dto/create-invitation-template.dto';
import { UpdateInvitationTemplateDto } from './dto/update-invitation-template.dto';
import { SendInvitationDto } from './dto/send-invitation.dto';
import { BaseQueryDto } from '../common/dto/base-query.dto';
import { createResponse, createPaginatedResponse } from '../common/utils/base-response';
import { extractQueryOptions } from '../common/helpers/query-options.helper';
import { API_PAGE_LIMIT } from '../common/constants/common.constant';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Invitation Templates')
@Controller({ path: 'invitation-templates', version: '1' })
export class InvitationTemplatesController {
  constructor(private readonly service: InvitationTemplatesService) {}

  @Get()
  @SetMetadata('abilities', [['browse', 'invitation_templates']])
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: BaseQueryDto) {
    const { paginationOptions } = extractQueryOptions(query, API_PAGE_LIMIT);
    const { items, meta } = await this.service.findAll(paginationOptions);
    return createPaginatedResponse('Invitation templates fetched successfully', items, meta);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', 'invitation_templates']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const item = await this.service.findById(id);
    return createResponse('Invitation template fetched successfully', item);
  }

  @Post()
  @SetMetadata('abilities', [['add', 'invitation_templates']])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateInvitationTemplateDto) {
    const item = await this.service.create(dto);
    return createResponse('Invitation template created successfully', item);
  }

  @Patch(':id')
  @SetMetadata('abilities', [['edit', 'invitation_templates']])
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateInvitationTemplateDto) {
    const item = await this.service.update(id, dto);
    return createResponse('Invitation template updated successfully', item);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'invitation_templates']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }

  @Post(':id/send')
  @SetMetadata('abilities', [['send', 'invitation_templates']])
  @HttpCode(HttpStatus.OK)
  async send(@Param('id') id: string, @Body() dto: SendInvitationDto) {
    await this.service.send(id, dto);
    return createResponse('Invitation sent successfully', null);
  }
}
