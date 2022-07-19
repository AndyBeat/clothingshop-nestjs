import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ApiCommon, ApiCustomResponse } from '@/common';
import { SystemService } from './system.service';
import { RespWebConfigDto } from './dto';
import { HttpInterceptor } from '@/interceptor';

@ApiCommon()
@Controller('/cms/api/system')
@ApiTags('SystemController')
@UseInterceptors(HttpInterceptor)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('/config/search')
  @ApiOperation({
    summary: '获取系统配置',
    description: '获取系统默认的全局配置',
  })
  @ApiCustomResponse({
    type: RespWebConfigDto,
  })
  getSystemConfig() {
    return this.systemService.getSystemConfig();
  }
}
