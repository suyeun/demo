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
    const url = 'http://3.39.177.24:3000/api/v1/admin/users/pushData';
    const data = {
      accessToken: '8809a64d910ea3765e6729acd2498158e6e8b70c99de87cf7d9f6891f506e42a',
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
          if (cur.marker.length > 0) acc[day].push(cur);
        });
        return acc;
      }, {});

      fs.writeFileSync('users.json', JSON.stringify(result));
    } catch (error) {
      console.error(`Error in getPushList: ${error}`);
    }
  }
  //@Cron(CronExpression.EVERY_DAY_AT_6AM) 오전 6시마다 실행
  @Cron(CronExpression.EVERY_DAY_AT_6AM) // 앱 실행 후 3초 후에 처음 수행되며, 3초마다 반복
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
    //console.log('today!!', today);
    fs.readFile('users.json', 'utf8', (err, data) => {
      const todayPush = JSON.parse(data);
      todayPush[today].forEach((data) => {
        const title = data.name;
        const startTime = data.startTime;
        const endTime = data.endTime;
        const pushToken = data.userId.pushToken;

        if (!data.startPush && this.getStartTimes(startTime, 10)) {
          this.fcmService.sendNotification(
            pushToken,
            '[' + title + '] ' + startTime + '~' + endTime,
            '내겐 벌어야되는 치킨값이 있다!! 출근체크하고 리워드 받아가세요.',
          );
          data.startPush = true; // 알림이 발송되었음을 기록
        }

        if (!data.endPush && this.getEndTimes(endTime, 10)) {
          this.fcmService.sendNotification(
            pushToken,
            '[' + title + '] ' + '기다리던 퇴근시간이에요!',
            '오늘 하루도 수고하셨습니다. 퇴근체크하고 리워드 받아가세요.',
          );
          data.endPush = true; // 알림이 발송되었음을 기록
        }
      });
      fs.writeFileSync('users.json', JSON.stringify(todayPush)); // 플래그 업데이트 후 다시 저장
    });
    //this.logger.log('Task Called!');
  }

  getEndTimes(data: string, check: number): boolean {
    //console.log('data', data);
    let time = data;
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const workDt = new Date();
    workDt.setHours(Number(hours), Number(minutes), 0, 0); // 입력된 시간 설정

    // 현재 시간 구하기
    const currentTime = new Date();

    // 시간 차이를 밀리초로 계산
    let diffInMillis = workDt.getTime() - currentTime.getTime();

    // 밀리초를 분 단위로 변환
    let diffInMinutes = Math.floor(diffInMillis / 1000 / 60);

    let diffInSeconds = Math.floor((diffInMillis / 1000) % 60);

    // 비교하는 분의 차이가 정확히 10분인 경우 true를 반환
    if (diffInMinutes === check && diffInSeconds === 1) {
      return true;
    } else {
      return false;
    }
  }

  getStartTimes(data: string, check: number): boolean {
    // 입력된 시간 (time)을 분리하여 workDt에 설정
    // 입력된 시간 (time)을 분리하여 workDt에 설정
    let time = data;
    const hours = time.split(':')[0];
    const minutes = time.split(':')[1];
    const workDt = new Date();
    workDt.setHours(Number(hours), Number(minutes), 0, 0); // 입력된 시간 설정

    // 현재 시간 구하기
    const currentTime = new Date();

    // 시간 차이를 밀리초로 계산
    let diffInMillis = workDt.getTime() - currentTime.getTime();

    // 밀리초를 분 단위로 변환
    let diffInMinutes = Math.floor(diffInMillis / 1000 / 60);

    let diffInSeconds = Math.floor((diffInMillis / 1000) % 60);
    // 비교하는 분의 차이가 정확히 10분인 경우 true를 반환
    if (diffInMinutes === check && diffInSeconds === 1) {
      return true;
    } else {
      return false;
    }
  }
}
