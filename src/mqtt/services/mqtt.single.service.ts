/**
 * Create by oliver.wu 2026/10/29
 */
import { Inject, Injectable } from '@nestjs/common';
import { SystemConfigSchemaService } from '@/entities/services';
import { MqttAbstractService, normalizeMqttConfig } from '../services';
import { MqttPublishInfo } from '../dto';
import { Utils } from '@/common/utils';
import { MemoryCacheService } from '@/cache/services';
import { SecretSchema } from '@/entities/schema';

@Injectable()
export class MqttSingleService {
  @Inject()
  private readonly systemConfigSchemaService: SystemConfigSchemaService;

  @Inject()
  private readonly memoryCacheService: MemoryCacheService;

  private mqttService: MqttAbstractService;
  private cacheTime: Date = new Date(); // 缓存5分钟不查库,避免修改配置没办法重新初始化

  async initMqttService() {
    // 缓存加时间
    this.cacheTime = new Date(this.cacheTime.getTime() + 5 * 60 * 1000);
    // 查询数据库的地址
    const where = {
      groupName: 'MqttConfig',
    };
    const configList = await this.systemConfigSchemaService
      .getChildrenConfigModel()
      .find(where);
    let mqttUrl = '';
    let mqttUsername = '';
    let mqttPassword = '';

    for (const item of configList) {
      switch (item.key) {
        case 'MqttUrl':
          mqttUrl = item.value;
          break;
        case 'MqttUsername':
          mqttUsername = await this.getValuePlainData(item.secretValue);
          break;
        case 'MqttPassword':
          mqttPassword = await this.getValuePlainData(item.secretValue);
          break;
      }
    }
    if (Utils.isEmpty(mqttUrl)) {
      throw new Error('MQTT not configured');
    }
    this.mqttService = new MqttAbstractService(
      normalizeMqttConfig({
        brokerUrl: mqttUrl,
        username: mqttUsername,
        password: mqttPassword,
      }),
    );
    this.mqttService.start();
  }

  async getValuePlainData(secretValue: SecretSchema) {
    const secretPem = await this.memoryCacheService.getInternalRsaPem(
      secretValue.secretId,
    );
    return Utils.rsaPrivateDecrypt(
      secretValue.secretText,
      secretPem.privatePem,
    );
  }

  async sendMessage(params: MqttPublishInfo) {
    if (!this.mqttService || this.cacheTime.getTime() < new Date().getTime()) {
      await this.initMqttService();
    }
    await this.mqttService.publish(params);
  }
}
