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
      console.log('!!!');

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
          acc[day].push(cur);
        });
        return acc;
      }, {});

      //fs.writeFileSync('users.json', JSON.stringify(result));
    } catch (error) {
      console.error(`Error in getPushList: ${error}`);
    }
  }

  @Interval('intervalTask', 13000) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
  handleInterval() {
    const token =
      'd98AKdh6X0B0sIvsK7bC0L:APA91bHh_8GKZSpV56shxfAKDesEfleoTM-UKCbI04G_W96TI87myBM80OlLati118S12XxIUJBBth8uX_hWcuzX-fFt41VxvXMqMocMTZiRBtiGA5lzzR0MEQAkg0UJYTQ45pD1_kwc';
    const title = 'title';
    const description = 'description';
    const response = this.fcmService.sendNotification(token, title, description);
    const getPushList = this.getPushList();
    console.log('getPushList', getPushList);
    this.logger.log('Task Called!');
  }

  @Cron(CronExpression.EVERY_SECOND)
  handleCron() {
    console.log('11111');
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
        const tt = this.getRecentTimes([startTime, endTime], 10);
        console.log('endTime', tt);
        //const response = this.fcmService.sendNotification(token, title, description);
      });
    });
    this.logger.log('Task Called!');
  }

  getRecentTimes(data: string[], minutes: number): string[] {
    const now = new Date();
    const nowInMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();

    return data.filter((time) => {
      const [hours, minutes] = time.split(':').map(Number);
      let timeInMinutes = hours * 60 + minutes;

      // 만약 시간 데이터가 다음 날로 넘어간 경우, 24시간(1440분)을 더해줍니다.
      if (timeInMinutes < nowInMinutes) {
        timeInMinutes += 24 * 60;
      }

      // 현재 시간과의 차이가 지정된 분 이내인지 확인
      return timeInMinutes - nowInMinutes <= minutes && timeInMinutes - nowInMinutes >= 0;
    });
  }
  // @Interval('intervalTask', 3000) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
  // handleInterval() {
  //   this.logger.log('Task Called!');
  // }

  // @Timeout('timeout', 3000) // 앱 실행 후 3초 뒤에 한번만 실행
  // handleTimeout() {
  //   this.logger.log('Task Called!');
  // }
}
