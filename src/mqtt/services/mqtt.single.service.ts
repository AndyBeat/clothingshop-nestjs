/**
 * Create by oliver.wu 2026/10/29
 */
import { Inject, Injectable } from '@nestjs/common';
import { SystemConfigSchemaService } from '@/entities/services';
import { MqttAbstractService } from '../services';
import { MqttPublishInfo } from '@/mqtt/dto';

@Injectable()
export class MqttSingleService {
  @Inject()
  private readonly systemConfigSchemaService: SystemConfigSchemaService;

  // @Inject()
  // private readonly mqttAbstractService: MqttAbstractService;

  sendMessage(params: MqttPublishInfo) {}
}
