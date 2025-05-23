/**
 * Create by oliver.wu 2024/10/10
 */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { CodeEnum, SequenceTypeEnum } from '@/common/enum';
import { SequenceModel, Sequence } from '../../schema';
import { Utils } from '@/common/utils';

@Injectable()
export class SequenceSchemaService {
  @InjectModel(Sequence.name)
  private readonly sequenceModel: SequenceModel;

  getModel() {
    return this.sequenceModel;
  }

  async getNextSequence(type: SequenceTypeEnum, shopId = 'SYSTEM') {
    const where = {
      type,
      shopId,
    };
    const updateFilter = {
      $inc: {
        sequenceId: 1,
      },
    };
    const updateOptions = {
      upsert: true,
    };
    const [err, result] = await Utils.toPromise(
      this.sequenceModel.findOneAndUpdate(where, updateFilter, updateOptions),
    );
    if (err) {
      return Promise.reject({
        message: err.message,
        code: CodeEnum.DB_EXEC_ERROR,
      });
    }
    const respResult = {
      shopId,
      type,
      sequenceId: 0,
    };
    if (result) {
      // 如果没有值说明是新增的
      // 因为拿到的是旧值,为了与数据库同步,加1即可
      respResult.sequenceId = result.sequenceId++;
    }
    return Promise.resolve(respResult);
  }
}
