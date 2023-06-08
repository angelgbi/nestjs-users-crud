import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: `API status checkpoint` })
  @ApiOkResponse({
    type: String,
    description:
      'Endpoint to check API status. Should return string "Hello World!" if API is running',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
