import { Controller, Post, Get, HttpStatus, HttpCode, Body, Req, Query } from '@nestjs/common';

import * as SPACE_DTO from '../dtos';
import { PushService } from '../services';

@Controller('api/v2/admin/push/')
export class PushController {
  constructor(private readonly pushService: PushService) {}

  @HttpCode(HttpStatus.OK)
  @Post('send')
  send(@Body() body: any) {
    return this.pushService.send(body);
  }

  @HttpCode(HttpStatus.OK)
  @Post('scheduleSend')
  scheduleSend(@Body() body: any) {
    return this.pushService.scheduleSend(body);
  }
}
