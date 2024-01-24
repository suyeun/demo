import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import serviceAccountKey from '../fcm/serviceAccountKey.json';

@Injectable()
export class FcmService {
  private fcm: admin.messaging.Messaging;

  constructor() {
    const serviceAccount = serviceAccountKey; // Firebase 서비스 계정 키(JSON 파일)의 경로
    console.log('serviceAccount', serviceAccount);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    });
    this.fcm = admin.messaging();
  }

  async sendNotification(token: string, title: string, body: string): Promise<string> {
    console.log('token', token);
    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
    };

    try {
      const response = await this.fcm.send(message);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to send notification.');
    }
  }

  async scheduleNotification(token: string, title: string, body: string, scheduleTime: Date): Promise<string> {
    const currentTime = new Date(); // 현재 시간
    const delayInMilliseconds = scheduleTime.getTime() - currentTime.getTime();

    if (delayInMilliseconds < 0) {
      throw new Error('Invalid schedule time. Schedule time should be in the future.');
    }

    const message: admin.messaging.Message = {
      token,
      notification: {
        title,
        body,
      },
      apns: {
        headers: {
          'apns-push-type': 'background',
          'apns-priority': '5',
          'apns-expiration': Math.floor(scheduleTime.getTime() / 1000).toString(),
        },
      },
      android: {
        ttl: delayInMilliseconds,
        priority: 'normal',
      },
    };

    try {
      const response = await this.fcm.send(message);
      return response;
    } catch (error) {
      console.log(error);
      throw new Error('Failed to send scheduled notification.');
    }
  }
}
