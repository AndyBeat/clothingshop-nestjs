/**
 * Create by oliver.wu 2026/10/29
 */
import { Injectable } from '@nestjs/common';
import { MqttPublishInfo } from '@/mqtt/dto';

import { CommonResult } from '@/common';

@Injectable()
export class MqttTestingService {
  sendMessage(params: MqttPublishInfo) {
    const resp = new CommonResult();
    return resp;
  }
}
