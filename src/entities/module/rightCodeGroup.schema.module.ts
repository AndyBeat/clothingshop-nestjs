/**
 * Create by oliver.wu 2024/9/19
 */
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RightCodeGroup, RightCodeGroupSchema } from '../schema';
import { RightCodeGroupSchemaService } from '../services';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RightCodeGroup.name, schema: RightCodeGroupSchema },
    ]),
  ],
  providers: [RightCodeGroupSchemaService],
  exports: [RightCodeGroupSchemaService],
})
export class RightCodeGroupSchemaModule {}
