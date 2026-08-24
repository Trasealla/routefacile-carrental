import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { AppConfig } from './config/app.config';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  
  @ApiExcludeEndpoint()
  @Get()
  getHello() {
    return "Hi from Node "+ AppConfig.get('JWT_EXPIRY');
  }
}
