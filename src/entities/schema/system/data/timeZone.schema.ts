/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

import { CommonData } from './systemData.schema';
import { timeZoneExp } from '@/common';

@Schema()
export class TimeZoneData extends CommonData {
  @Prop({
    required: true,
    trim: true,
  })
  timeZone: string; // 时区名称

  @Prop({
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  summer: string; // 夏令时

  @Prop({
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  winter: string; // 冬令时
}

export type TimeZoneDataDocument = HydratedDocument<TimeZoneData>;

export const TimeZoneDataSchema = SchemaFactory.createForClass(TimeZoneData);

TimeZoneDataSchema.statics.getAliasName = function () {
  return 'TimeZoneData';
};

export interface TimeZoneDataModel extends Model<TimeZoneData> {
  getAliasName(): string;
}
