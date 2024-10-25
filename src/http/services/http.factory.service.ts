/**
 * Create by oliver.wu 2024/10/25
 */
import { Injectable, Inject } from '@nestjs/common';

import { LocalhostHttpService } from './localhost.http.service';
import { StagingHttpService } from './staging.http.service';
import { JwtHttpService } from './jwt.http.service';

import type { HttpAbstractService } from './http.abstract.service';

@Injectable()
export class HttpFactoryService {
  @Inject()
  private readonly localhostHttpService: LocalhostHttpService;

  @Inject()
  private readonly stagingHttpService: StagingHttpService;

  @Inject()
  private readonly jwtHttpService: JwtHttpService;

  getHttpService(shopType: string): HttpAbstractService {
    // TODO 以后这里传入session,等各种参数,以及查库操作,并且存缓存
    // 每种类型的每个用户存一个独立的Service,然后通过service的初始化config等覆盖公共配置
    // 这样实现类就可以获取到不同的配置了
    if (shopType === 'localhost') {
      return this.localhostHttpService;
    } else if (shopType === 'staging') {
      return this.stagingHttpService;
    } else if (shopType === 'jwt') {
      return this.jwtHttpService;
    } else {
      throw new Error(`Cannot find http service instance: ${shopType}`);
    }
  }
}
