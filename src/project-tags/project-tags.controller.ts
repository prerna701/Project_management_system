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
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ProjectTagsService } from './project-tags.service';
import { CreateProjectTagDto } from './dto/create-project-tag.dto';
import { UpdateProjectTagDto } from './dto/update-project-tag.dto';
import { createResponse } from '../common/utils/base-response';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Project Tags')
@Controller({ path: 'project-tags', version: '1' })
export class ProjectTagsController {
  constructor(private readonly service: ProjectTagsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const tags = await this.service.findAll();
    return createResponse('Project tags fetched successfully', tags);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    const tag = await this.service.findById(id);
    return createResponse('Project tag fetched successfully', tag);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateProjectTagDto) {
    const tag = await this.service.create(dto);
    return createResponse('Project tag created successfully', tag);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() dto: UpdateProjectTagDto) {
    const tag = await this.service.update(id, dto);
    return createResponse('Project tag updated successfully', tag);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.service.remove(id);
  }
}
