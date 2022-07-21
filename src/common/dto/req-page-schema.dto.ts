import { SortEnum } from '../enum';
import { Expose } from 'class-transformer';
import { CustomValidation } from '../decorator';

export class ReqPageSchemaDto {
  /**
   * 查询条件,按空格分隔可查询多个条件
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: String,
  })
  condition?: string;

  /**
   * 页码,设置查询第几页数据
   * @default 1
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: Number,
    default: 1,
    min: 1,
    isInt: true
  })
  offset?: number = 1;

  /**
   * 每页返回数
   * @default 30
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: Number,
    max: 100,
    default: 30,
    isInt: true
  })
  pageSize?: number = 30;

  /**
   * 排序字段名称
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: String,
  })
  sortName?: string;

  /**
   * 排序方式,默认降序:(asc=升序,desc=降序)
   */
  @Expose()
  @CustomValidation({
    optional: true,
    type: String,
    enum: ['asc', 'desc']
  })
  orderBy?: SortEnum;
}
