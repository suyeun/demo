import { HttpStatus, Injectable } from '@nestjs/common';
import * as PUSH_DTO from '../dtos';
import { PushRepository } from '../repositories';
import { FcmService } from '../../application/services/fcm/fcm.service';

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
}
