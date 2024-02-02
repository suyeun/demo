import { HttpStatus, Injectable } from '@nestjs/common';
import * as PUSH_DTO from '../dtos';
import { PushRepository } from '../repositories';
import { FcmService } from '../../application/services/fcm/fcm.service';
import axios from 'axios';

@Injectable()
export class PushService {
  constructor(private readonly pushRepository: PushRepository, private readonly fcmService: FcmService) {}

  async send(body: PUSH_DTO.SendPushDto) {
    const { token, title, description } = body;
    const response = await this.fcmService.sendNotification(token, title, description);
    return {};
  }

  async scheduleSend(body: PUSH_DTO.SendPushDto) {
    const { token, title, description, scheduleTime } = body;

    const today = new Date();
    //tDate.setMinutes(tDate.getMinutes() + 30);
    const response = await this.fcmService.scheduleNotification(token, title, description, today);
    return {};
  }

  async getPushList() {
    //http://13.125.225.85:3000/api/v1/admin/users/pushData //POST
    const url = 'http://13.125.225.85:3000/api/v1/admin/users/pushData';
    const data = {
      accessToken: 'e50f15b83ef461e35bc21970ef5e200675f40a816e7aa33261060671a70bdd2f',
      command: {},
    }; // 여기에 보낼 데이터를 채워 넣으세요.

    try {
      const response = await axios.post(url, data);
      console.log(response.data);
    } catch (error) {
      console.error(`Error in getPushList: ${error}`);
    }
  }
}
