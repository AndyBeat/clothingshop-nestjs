/**
 * Create by oliver.wu 2024/10/14
 */
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model, InferRawDocType } from 'mongoose';

import { CommonData } from './systemData.schema';
import { timeZoneExp } from '@/common';

@Schema()
export class TimeZoneData extends CommonData {
  @Prop({
    type: String,
    required: true,
    trim: true,
  })
  timeZone: string; // 时区名称

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  summer: string; // 夏令时

  @Prop({
    type: String,
    required: true,
    trim: true,
    match: timeZoneExp,
  })
  winter: string; // 冬令时
}

export type TimeZoneDataDocument = HydratedDocument<TimeZoneData>;

// 如果使用lean时返回类型用这个
export type RawTimeZoneDataDocument = InferRawDocType<TimeZoneData>;

export const TimeZoneDataSchema = SchemaFactory.createForClass(TimeZoneData);

TimeZoneDataSchema.statics.getAliasName = function () {
  return 'TimeZoneData';
};

export interface TimeZoneDataModel extends Model<TimeZoneData> {
  getAliasName(): string;
}
