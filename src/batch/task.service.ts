import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FcmService } from '../application/services/fcm/fcm.service';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  // ScheduleRegistry 객체를 TaskService 에 주입
  constructor(private schedulerRegistry: SchedulerRegistry, private readonly fcmService: FcmService) {
    // TaskService 가 생성될 때 Cron Job 하나를 SchedulerRegistry 에 추가함
    // SchedulerRegistry 에 Cron Job 을 추가만 해두는 것이지 Task Scheduling 을 등록하는 것은 아님
    this.addCronJob();
    this.handleInterval();
  }

  addCronJob() {
    const name = 'cronSample';

    const job = new CronJob('* * * * * *', () => {
      console.log('!!!');
      this.logger.warn(`run! ${name}`);
    });

    this.schedulerRegistry.addCronJob(name, job);

    this.logger.warn(`job ${name} added!!`);
  }

  @Interval('intervalTask', 3000) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
  handleInterval() {
    console.log('@@@@');
    const token =
      'dIxLbO8KQh2_SIUrTiDtA0:APA91bHgkD8pkBekfnZ90BMtcSSlxHrJDZL7oHZ8EkKQNIT6y-XB8puswrTI_B91mg-roUYBzWYLqRuFHJJl-UWB68aA3mpJx7lyuXTI3DFSsgAEUCPzUFm_JW53kWGisCpXIOj-nEEe';
    const title = 'title';
    const description = 'description';
    const response = this.fcmService.sendNotification(token, title, description);

    this.logger.log('Task Called!');
  }

  //@Cron('* * * * * *', { name: 'cronTask' })  // 매 1초마다 수행
  //@Cron(new Date(Date.now() + 3 * 1000)) // 앱이 실행되고 나서 3초 뒤에 수행
  // @Cron(CronExpression.MONDAY_TO_FRIDAY_AT_1AM) // 월~금 새벽 1시에 수행
  // handleCron() {
  //   this.logger.log('Task Called!');
  // }

  // @Interval('intervalTask', 3000) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
  // handleInterval() {
  //   this.logger.log('Task Called!');
  // }

  // @Timeout('timeout', 3000) // 앱 실행 후 3초 뒤에 한번만 실행
  // handleTimeout() {
  //   this.logger.log('Task Called!');
  // }
}
