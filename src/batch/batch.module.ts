import { Module, forwardRef } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { BatchController } from './batch.controller';
import * as ApplicationModules from '../application/application.modules';
@Module({
  imports: [ScheduleModule.forRoot(), forwardRef(() => ApplicationModules.ApplicationModules)],
  providers: [TaskService],
  controllers: [BatchController],
})
export class BatchModule {}
