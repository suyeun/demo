import { Injectable } from '@nestjs/common';
import * as NOTICE_DTO from '../dtos';

@Injectable()
export class PushRepository {
  constructor() {}
  //page * pageSize, pageSize, service
  async findAll(offset: number = 0, limit: number = 30) {
    const raw = {};
    return raw;
  }
}
