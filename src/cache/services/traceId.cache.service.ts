/**
 * Create by oliver.wu 2024/10/23
 */
import { Injectable, Inject } from '@nestjs/common';
import { TRACE_ID_CACHE_MANAGER } from '../cache.constants';

import type { Cache } from 'cache-manager';
import { CmsSession } from '@/common';
import { Utils } from '@/common/utils';
import { ConfigService } from '@/common/config';
import { OnEventMessage, SendEventMessage } from '@/lib/event-message';

@Injectable()
export class TraceIdCacheService {
  @Inject(TRACE_ID_CACHE_MANAGER)
  private readonly cacheManager: Cache;

  @Inject()
  private readonly configService: ConfigService;

  @SendEventMessage('asyncTraceIdCache')
  async setTraceIdCache(session: CmsSession, traceId: string) {
    await this.updateTraceIdCache(session, traceId);
  }

  @OnEventMessage('asyncTraceIdCache')
  async updateTraceIdCache(session: CmsSession, traceId: string) {
    if (Utils.isEmpty(traceId) || !/^\d{15}#\d+$/.test(traceId)) {
      return;
    }
    await this.cacheManager.set(session.requestId, traceId);
  }

  async getTraceIdCache(session: CmsSession, isUpdate: boolean = true) {
    const key = session.requestId;
    let traceId: string = await this.cacheManager.get<string>(key);
    const now = Date.now();
    if (Utils.isEmpty(traceId)) {
      traceId =
        this.configService.get<string>('serverId').toString() +
        session.workerId.toString() +
        now.toString() +
        '#1';
    } else {
      const [tempTraceId, number] = traceId.split('#');
      const sequence: number = isUpdate ? +number + 1 : +number;
      traceId = tempTraceId + '#' + sequence;
    }
    await this.setTraceIdCache(session, traceId);
    return traceId;
  }

  getTraceIdStore() {
    return this.cacheManager;
  }

  @SendEventMessage('deleteTraceIdCache')
  async deleteTraceIdCache(session: CmsSession) {
    await this.messageDeleteTraceIdCache(session);
  }

  @OnEventMessage('deleteTraceIdCache')
  async messageDeleteTraceIdCache(session: CmsSession) {
    if (!Utils.isEmpty(session?.requestId)) {
      await this.getTraceIdStore().del(session.requestId);
    }
  }
}
