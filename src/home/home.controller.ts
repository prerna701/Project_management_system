import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller('/')
export class HomeController {
  @Get()
  home() {
    return { success: true, message: 'NestJS Boilerplate API is running!' };
  }
}
