/**
 * Create by CC on 2022/7/20
 * 权限规则,一般4位数,首位是功能序号,中间是子功能序号,最后是子功能后的细节权限
 * 如果超过2位,考虑使用字母或者使用2位数,例如 10 01 01 => 100101
 */

import { Utils } from '@/common/utils';

export type RightsProp = RightsConfigElement & {
  key: string;
  category?: string;
  path?: string;
};

type RightsConfigElement = {
  code: string;
  desc: string;
  children?: RightsConfig;
};

export type RightsConfig = {
  [key: string]: RightsConfigElement;
};

// 这里定义的枚举的值是数字,ts编译不过去,坑爹,其实也可以是字符串的
export enum RightsEnum {
  OtherSetup = '3000',
  SystemDataSetup = '3010',
  SystemBaseSetup = '3011',
  AllConfigList = '30111',
  ConfigCreate = '30112',
  ConfigModify = '30113',
  ConfigDelete = '30114',
  ConfigChildrenCreate = '30115',
  ConfigChildrenModify = '30116',
  PackageVersionSetup = '3012',
  GetSequenceNumber = '3013',
  TimeZoneSetup = '3014',
  TimeZoneList = '30141',
  TimeZoneCreate = '30142',
  TimeZoneSync = '30143',
  TimeZoneModify = '30144',
  TimeZoneDelete = '30145',
  UserSetup = '3020',
  RightsSetup = '3030',
  RightsGroupSetup = '3031',
  RightsGroupCreate = '30311',
  RightsGroupModify = '30312',
  RightsGroupDelete = '30313',
  RightsCodeSetup = '3032',
  RightsCodeModify = '30321',
  RepairData = '3040',
  RepairBaseData = '3041',
  RepairDBIndex = '3042',
  RepairRightsGroup = '3043',
  SelfCheck = '3044',
  DatabaseManage = '3050',
  DbStatistics = '3051',
  DbIndexManage = '3052',
  DbDetails = '3053',
  DbLogs = '3054',
  LogsManage = '4000',
  ServerLogSetup = '4010',
  ServerLogView = '4011',
  ServerLogDownload = '4012',
}

export const RightsList: RightsConfig = {
  OtherSetup: {
    code: RightsEnum.OtherSetup, // 3000
    desc: '其他设置',
    children: {
      SystemDataSetup: {
        code: RightsEnum.SystemDataSetup, // 3010
        desc: '系统数据设置',
        children: {
          // 针对系统中各种杂七杂八的数据配置
          SystemBaseSetup: {
            code: RightsEnum.SystemBaseSetup, // 3011
            desc: '基础设置',
            children: {
              AllConfigList: {
                code: RightsEnum.AllConfigList, // 30111
                desc: '系统配置列表',
              },
              ConfigCreate: {
                code: RightsEnum.ConfigCreate, // 30112
                desc: '创建一级系统配置',
              },
              ConfigModify: {
                code: RightsEnum.ConfigModify, // 30113
                desc: '编辑一级系统配置',
              },
              ConfigDelete: {
                code: RightsEnum.ConfigDelete, // 30114
                desc: '删除一级系统配置',
              },
              ConfigChildrenCreate: {
                code: RightsEnum.ConfigChildrenCreate, // 30115
                desc: '创建二级系统配置',
              },
              ConfigChildrenModify: {
                code: RightsEnum.ConfigChildrenModify, // 30116
                desc: '编辑二级系统配置',
              },
            },
          },
          // 查库依赖包版本
          PackageVersionSetup: {
            code: RightsEnum.PackageVersionSetup, // 3012
            desc: '获取依赖包版本',
          },
          GetSequenceNumber: {
            code: RightsEnum.GetSequenceNumber, // 3013
            desc: '获取序列号',
          },
          TimeZoneSetup: {
            code: RightsEnum.TimeZoneSetup, // 3014
            desc: '时区设置',
            children: {
              TimeZoneList: {
                code: RightsEnum.TimeZoneList, // 30141
                desc: '时区列表',
              },
              TimeZoneCreate: {
                code: RightsEnum.TimeZoneCreate, // 30142
                desc: '创建时区',
              },
              TimeZoneSync: {
                code: RightsEnum.TimeZoneSync, // 30143
                desc: '同步时区数据',
              },
              TimeZoneModify: {
                code: RightsEnum.TimeZoneModify, // 30144
                desc: '编辑时区数据',
              },
              TimeZoneDelete: {
                code: RightsEnum.TimeZoneDelete, // 30145
                desc: '删除时区数据',
              },
            },
          },
          // 后续计划邮箱设置,国家/省份/城市设置,动态参数设置,消息设置,都归属在里面吧
        },
      },
      UserSetup: {
        code: RightsEnum.UserSetup, // 3020
        desc: '用户管理',
      },
      RightsSetup: {
        code: RightsEnum.RightsSetup, // 3030
        desc: '权限设置',
        children: {
          RightsGroupSetup: {
            code: RightsEnum.RightsGroupSetup, // 3031
            desc: '权限组设置',
            children: {
              RightsGroupCreate: {
                code: RightsEnum.RightsGroupCreate, // 30311
                desc: '新建权限组',
              },
              RightsGroupModify: {
                code: RightsEnum.RightsGroupModify, // 30312
                desc: '编辑权限组',
              },
              RightsGroupDelete: {
                code: RightsEnum.RightsGroupDelete, // 30313
                desc: '删除权限组',
              },
            },
          },
          RightsCodeSetup: {
            code: RightsEnum.RightsCodeSetup, // 3032
            desc: '权限代码设置',
            children: {
              RightsCodeModify: {
                code: RightsEnum.RightsCodeModify, // 30321
                desc: '编辑权限代码',
              },
            },
          },
        },
      },
      RepairData: {
        code: RightsEnum.RepairData, // 3040
        desc: '修复系统数据',
        children: {
          RepairBaseData: {
            code: RightsEnum.RepairBaseData, // 3041
            desc: '修复基础数据',
          },
          RepairDBIndex: {
            code: RightsEnum.RepairDBIndex, // 3042
            desc: '修复数据库索引',
          },
          RepairRightsGroup: {
            code: RightsEnum.RepairRightsGroup, // 3043
            desc: '修复权限数据',
          },
          SelfCheck: {
            code: RightsEnum.SelfCheck, // 3044
            desc: '自动检查',
          },
        },
      },
      DatabaseManage: {
        code: RightsEnum.DatabaseManage, // 3050
        desc: '数据库管理',
        children: {
          DbStatistics: {
            code: RightsEnum.DbStatistics, // 3051
            desc: '数据库统计',
          },
          DbIndexManage: {
            code: RightsEnum.DbIndexManage, // 3052
            desc: '索引管理',
          },
          DbDetails: {
            code: RightsEnum.DbDetails, // 3053
            desc: '数据库详情',
          },
          DbLogs: {
            code: RightsEnum.DbLogs, // 3054
            desc: '数据库日志',
          },
        },
      },
    },
  },
  LogsManage: {
    code: RightsEnum.LogsManage, // 4000
    desc: '日志管理',
    children: {
      ServerLogSetup: {
        code: RightsEnum.ServerLogSetup, // 4010
        desc: '服务器日志',
        children: {
          ServerLogView: {
            code: RightsEnum.ServerLogView, // 4011
            desc: '查看服务器日志',
          },
          ServerLogDownload: {
            code: RightsEnum.ServerLogDownload, // 4012
            desc: '下载服务器日志',
          },
        },
      },
    },
  },
};

export const getAllRightsCode = () => {
  const [, codeArr] = Utils.enumToArray(RightsEnum);
  return codeArr;
};

export const RightsGroupList = [
  {
    groupCode: 'SUPERVISOR',
    groupName: '超级管理员',
    rightCodes: getAllRightsCode(),
  },
];
