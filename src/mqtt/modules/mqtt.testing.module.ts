/**
 * Create by oliver.wu 2026/10/29
 */
import { Module } from '@nestjs/common';
import { MqttTestingService } from '../services';
import { MqttTestingController } from '../controllers';

@Module({
  controllers: [MqttTestingController],
  providers: [MqttTestingService],
})
export class MqttTestingModule {}
