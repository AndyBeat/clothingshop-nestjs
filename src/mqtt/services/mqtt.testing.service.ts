/**
 * Create by oliver.wu 2026/10/29
 */
import { Inject, Injectable } from '@nestjs/common';
import { MqttPublishInfo } from '@/mqtt/dto';

import { CommonResult } from '@/common';
import { MqttSingleService } from '@/mqtt';

@Injectable()
export class MqttTestingService {
  @Inject()
  private readonly mqttSingleService: MqttSingleService;

  sendMessage(params: MqttPublishInfo) {
    const resp = new CommonResult();
    try {
      this.mqttSingleService.sendMessage(params);
    } catch (e) {
      resp.msg = e.message;
    }
    return resp;
  }
}
