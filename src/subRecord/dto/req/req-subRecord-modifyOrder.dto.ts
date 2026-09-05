/**
 * Create by oliver.wu 2026/7/15
 */
import { PartialType, IntersectionType } from '@andybeat/swagger';
import { SubRecordOrderDto } from '../subRecord-order.dto';
import { ReqSubRecordDeleteOrderDto } from './req-subRecord-deleteOrder.dto';

export class ReqSubRecordModifyOrderDto extends IntersectionType(
  PartialType(SubRecordOrderDto),
  ReqSubRecordDeleteOrderDto,
) {}
