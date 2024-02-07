import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { FcmService } from '../application/services/fcm/fcm.service';
import axios from 'axios';
import fs from 'fs';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  // ScheduleRegistry 객체를 TaskService 에 주입
  constructor(private schedulerRegistry: SchedulerRegistry, private readonly fcmService: FcmService) {
    // TaskService 가 생성될 때 Cron Job 하나를 SchedulerRegistry 에 추가함
    // SchedulerRegistry 에 Cron Job 을 추가만 해두는 것이지 Task Scheduling 을 등록하는 것은 아님
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
    const url = 'http://13.125.225.85:3000/api/v1/admin/users/pushData';
    const data = {
      accessToken: 'e50f15b83ef461e35bc21970ef5e200675f40a816e7aa33261060671a70bdd2f',
      command: {},
    }; // 여기에 보낼 데이터를 채워 넣으세요.

    try {
      const response = await axios.post(url, data);
      let result = response.data.command.reduce((acc, cur) => {
        cur.workDay.forEach((day) => {
          if (!acc[day]) {
            acc[day] = [];
          }
          cur.startPush = false;
          cur.endPush = false;
          acc[day].push(cur);
        });
        return acc;
      }, {});

      fs.writeFileSync('users.json', JSON.stringify(result));
    } catch (error) {
      console.error(`Error in getPushList: ${error}`);
    }
  }
  //@Cron(CronExpression.EVERY_DAY_AT_6AM) 오전 6시마다 실행
  @Cron(CronExpression.EVERY_HOUR) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
  handleInterval() {
    this.getPushList();
    //const title = 'title';
    //const description = 'description';
    //const response = this.fcmService.sendNotification(token, title, description);
    this.logger.log('CREATE USER DATA');
  }

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    const date = new Date();
    let day = date.getDay(); // 0 (일요일) ~ 6 (토요일)
    let today = '1';
    // 일요일을 7로, 월요일을 1로 변형
    if (day === 0) {
      day = 7;
    }
    today = String(day);

    fs.readFile('users.json', 'utf8', (err, data) => {
      //console.log(JSON.parse(data));
      const todayPush = JSON.parse(data);
      todayPush[today].forEach((data) => {
        //console.log(data.name, data.startTime, data.endTime, data.userId.pushToken);

        const title = data.name;
        const startTime = data.startTime;
        const endTime = data.endTime;
        const pushToken = data.userId.pushToken;

        //console.log(startTime);
        const startTimeCK = this.getStartTimes(startTime, 20);
        if (startTimeCK == true) {
          const response = this.fcmService.sendNotification(pushToken, '오늘 알바 시작!', title + ' 출근시간입니다.');
        }

        const endTimeCK = this.getEndTimes(endTime, 20);
        if (endTimeCK == true) {
          const response = this.fcmService.sendNotification(pushToken, '오늘 알바 완료!', title + ' 퇴근시간입니다.');
        }
      });
    });
    this.logger.log('Task Called!');
  }

  getEndTimes(data: string, check: number): boolean {
    //console.log('data', data);
    let time = data;
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const workDt = new Date();

    workDt.setHours(Number(hours), Number(minutes), 0, 0);
    workDt.setHours(workDt.getHours() + 9);

    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 9);

    let diff = workDt.getTime() - newDate.getTime(); // 시간 차이를 밀리초로 계산

    let diffInMinutes = Math.floor(diff / 1000 / 60); //분 단위로 계산
    let diffInSeconds = Math.floor((diff / 1000) % 60); // 초 단위로 계산

    //564997
    if (diffInMinutes == 10 && diffInSeconds == 0) {
      return true;
    } else {
      return false;
    }
  }

  getStartTimes(data: string, check: number): boolean {
    //console.log('data', data);
    let time = data;
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const workDt = new Date();

    workDt.setHours(Number(hours), Number(minutes), 0, 0);
    workDt.setHours(workDt.getHours() + 9);

    const newDate = new Date();
    newDate.setHours(newDate.getHours() + 9);

    let diff = workDt.getTime() - newDate.getTime(); // 시간 차이를 밀리초로 계산

    let diffInMinutes = Math.floor(diff / 1000 / 60); //분 단위로 계산
    let diffInSeconds = Math.floor((diff / 1000) % 60); // 초 단위로 계산

    //564997
    if (diffInMinutes == 10 && diffInSeconds == 0) {
      return true;
    } else {
      return false;
    }
  }
}
