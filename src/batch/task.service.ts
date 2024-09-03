import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FcmService } from '../application/services/fcm/fcm.service';
import axios from 'axios';
import fs from 'fs';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(private schedulerRegistry: SchedulerRegistry, private readonly fcmService: FcmService) {
    this.addCronJob();
    this.handleInterval();
    this.handleCron();
  }

  addCronJob() {
    const name = 'cronSample';

    const job = new CronJob('* * * * * *', () => {
      this.logger.warn(`run! ${name}`);
    });

    this.schedulerRegistry.addCronJob(name, job);

    this.logger.warn(`job ${name} added!!`);
  }

  async getPushList() {
    const url = 'http://3.39.177.24:3000/api/v1/admin/users/pushData';
    const data = {
      accessToken: '8809a64d910ea3765e6729acd2498158e6e8b70c99de87cf7d9f6891f506e42a',
      command: {},
    };

    try {
      const response = await axios.post(url, data);
      let result = response.data.command.reduce((acc, cur) => {
        cur.workDay.forEach((day) => {
          if (!acc[day]) {
            acc[day] = [];
          }
          cur.startPush = false; // Initialize push flags
          cur.endPush = false; // Initialize push flags
          if (cur.marker.length > 0) acc[day].push(cur);
        });
        return acc;
      }, {});

      fs.writeFileSync('users.json', JSON.stringify(result));
    } catch (error) {
      console.error(`Error in getPushList: ${error}`);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  handleInterval() {
    this.getPushList();
    this.logger.log('CREATE USER DATA');
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    const date = new Date();
    let day = date.getDay();
    let today = '1';
    if (day === 0) {
      day = 7;
    }
    today = String(day);

    try {
      const data = await fs.promises.readFile('users.json', 'utf8');
      const todayPush = JSON.parse(data);
      if (!todayPush[today]) return; // No data for today

      await Promise.all(
        todayPush[today].map(async (user) => {
          const title = user.name;
          const startTime = user.startTime;
          const endTime = user.endTime;
          const pushToken = user.userId.pushToken;

          // Start Push
          if (!user.startPush && this.getStartTimes(startTime, 10)) {
            try {
              // 푸시 메시지를 보낸 후 바로 플래그를 true로 설정
              await this.fcmService.sendNotification(
                pushToken,
                `[${title}] ${startTime}~${endTime}`,
                '내겐 벌어야되는 치킨값이 있다!! 출근체크하고 리워드 받아가세요.',
              );
              user.startPush = true; // Mark start push as sent only if successful
              await this.updatePushData(todayPush); // Update file after each push
              console.log(`Start push sent for user: ${user.name} at ${new Date().toISOString()}`);
            } catch (error) {
              this.logger.error(`Failed to send start push notification: ${error}`);
            }
          }

          // End Push
          if (!user.endPush && this.getEndTimes(endTime, 10)) {
            try {
              // 푸시 메시지를 보낸 후 바로 플래그를 true로 설정
              await this.fcmService.sendNotification(
                pushToken,
                `[${title}] 기다리던 퇴근시간이에요!`,
                '오늘 하루도 수고하셨습니다. 퇴근체크하고 리워드 받아가세요.',
              );
              user.endPush = true; // Mark end push as sent only if successful
              await this.updatePushData(todayPush); // Update file after each push
              console.log(`End push sent for user: ${user.name} at ${new Date().toISOString()}`);
            } catch (error) {
              this.logger.error(`Failed to send end push notification: ${error}`);
            }
          }
        }),
      );
    } catch (error) {
      this.logger.error(`Error reading or updating users.json: ${error}`);
    }
  }

  async updatePushData(updatedData: any) {
    try {
      await fs.promises.writeFile('users.json', JSON.stringify(updatedData));
    } catch (error) {
      this.logger.error(`Failed to update users.json: ${error}`);
    }
  }

  getEndTimes(data: string, check: number): boolean {
    const [hours, minutes] = data.split(':').map(Number);
    const workDt = new Date();
    workDt.setHours(hours, minutes, 0, 0);

    const currentTime = new Date();
    let diffInMillis = workDt.getTime() - currentTime.getTime();
    let diffInMinutes = Math.floor(diffInMillis / 1000 / 60);

    return diffInMinutes === check;
  }

  getStartTimes(data: string, check: number): boolean {
    const [hours, minutes] = data.split(':').map(Number);
    const workDt = new Date();
    workDt.setHours(hours, minutes, 0, 0);

    const currentTime = new Date();
    let diffInMillis = workDt.getTime() - currentTime.getTime();
    let diffInMinutes = Math.floor(diffInMillis / 1000 / 60);

    return diffInMinutes === check;
  }
}
