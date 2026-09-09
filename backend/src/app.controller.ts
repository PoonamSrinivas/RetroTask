import { Controller, Get, Post } from '@nestjs/common';
import { AppService, Member } from './app.service.js';

@Controller('api')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('members')
  getMembers(): Member[] {
    return this.appService.getMembers();
  }

  @Post('spin')
  spin(): { winner: Member, isReset: boolean } {
    return this.appService.spin();
  }

  @Post('reset')
  reset(): { success: boolean } {
    this.appService.reset();
    return { success: true };
  }
}
