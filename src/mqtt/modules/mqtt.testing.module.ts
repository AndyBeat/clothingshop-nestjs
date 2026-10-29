/**
 * Create by oliver.wu 2026/10/29
 */
import { Module } from '@nestjs/common';
import { MqttTestingService, MqttSingleService } from '@/mqtt';
import { MqttTestingController } from '../controllers';
import { SystemConfigSchemaModule } from '@/entities/modules';

@Module({
  imports: [SystemConfigSchemaModule],
  controllers: [MqttTestingController],
  providers: [MqttTestingService, MqttSingleService],
})
export class MqttTestingModule {}
