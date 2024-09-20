/**
 * Create by oliver.wu 2024/9/20
 */
import { Controller, Post, UseInterceptors, UseGuards, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse } from '@/common/decorator';
import { HttpInterceptor } from '@/interceptor/http';
import { SessionGuard } from '@/guard';
import { ApiRights, RightsEnum } from '@/rights';

import { DatabaseService } from '../services/database.service';
import { CommonResult } from '@/common/dto';
import { RespCollectionsName } from '../dto';

@ApiCommon()
@Controller('/cms/api/database')
@ApiTags('DatabaseController')
@UseGuards(SessionGuard)
@UseInterceptors(HttpInterceptor)
@ApiRights(RightsEnum.DatabaseManage)
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Post('/statistics/collections')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '统计数据库表数据大小',
    description: '统计所有表的数据大小及其他信息',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.DbStatistics)
  getDbStatistics() {
    return this.databaseService.getDbStatistics();
  }

  @Post('/indexes/list')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '获取表索引列表',
    description: '查询数据库表索引',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.DbIndexManage)
  getDbIndexList() {
    return this.databaseService.getDbIndexList();
  }

  @Get('/details/info')
  @ApiOperation({
    summary: '获取数据库信息',
    description: '获取数据库详细信息和状态',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.DbDetails)
  getDbDetails() {
    return this.databaseService.getDbDetails();
  }

  @Get('/monitor/logs')
  @ApiOperation({
    summary: '数据库监控日志',
    description: '获取系统访问数据库的监控语句',
  })
  @ApiCustomResponse({
    type: CommonResult,
  })
  @ApiRights(RightsEnum.DbLogs)
  getDbLogs() {
    return this.databaseService.getDbLogs();
  }

  @Get('/collections/name')
  @ApiOperation({
    summary: '获取数据库表名',
    description: '获取数据库表名别名列表',
  })
  @ApiCustomResponse({
    type: RespCollectionsName,
  })
  getDbCollectionsName() {
    return this.databaseService.getDbCollectionsName();
  }
}