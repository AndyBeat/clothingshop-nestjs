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
  providers: [
    {
      provide: MqttTestingService,
      inject: [MqttSingleService],
      useClass: MqttTestingService,
    }
  ],
})
export class MqttTestingModule {}
