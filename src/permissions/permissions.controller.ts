import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { createResponse } from '../common/utils/base-response';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@ApiTags('Permissions')
@Controller({ path: 'permissions', version: '1' })
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @ApiQuery({ name: 'module', required: false, type: String })
  @SetMetadata('abilities', [['browse', 'permissions']])
  @HttpCode(HttpStatus.OK)
  async findAll(@Query('module') module?: string) {
    const perms = module
      ? await this.permissionsService.findByModule(module)
      : await this.permissionsService.findAll();
    return createResponse('Permissions fetched successfully', perms);
  }

  @Get(':id')
  @SetMetadata('abilities', [['read', 'permissions']])
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const perm = await this.permissionsService.findById(id);
    return createResponse('Permission fetched successfully', perm);
  }

  @Post()
  @SetMetadata('abilities', [['add', 'permissions']])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreatePermissionDto) {
    const perm = await this.permissionsService.create(dto);
    return createResponse('Permission created successfully', perm);
  }

  @Patch(':id')
  @SetMetadata('abilities', [['edit', 'permissions']])
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ) {
    const perm = await this.permissionsService.update(id, dto);
    return createResponse('Permission updated successfully', perm);
  }

  @Delete(':id')
  @SetMetadata('abilities', [['delete', 'permissions']])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    await this.permissionsService.remove(id);
  }
}
