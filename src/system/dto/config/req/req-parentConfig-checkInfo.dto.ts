/**
 * Create by oliver.wu 2025/2/18
 */
import { ModifyParentConfigDto } from '../modify-parentConfig.dto';
import { PartialType } from '@andybeat/swagger';

export class ReqParentConfigCheckInfoDto extends PartialType(
  ModifyParentConfigDto,
) {}
