/**
 * Create by oliver.wu 2024/10/24
 */
import { Injectable } from '@nestjs/common';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { CommonResult } from '@/common';
import { Utils } from '@/common/utils';
import { CodeEnum } from '@/common/enum';

import { HttpAbstractService } from './http.abstract.service';
import { Observable, firstValueFrom } from 'rxjs';
import * as crypto from 'node:crypto';

@Injectable()
export class LocalhostHttpService extends HttpAbstractService {
  initInterceptor() {
    this.service.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.httpServiceCacheService.getServiceToken(
          this.options,
        );
        if (Utils.isEmpty(config.headers['credential'])) {
          config.headers['credential'] = token?.credential ?? '';
          // TODO 这里应该使用的是登录第三方的用户和店铺ID做key值,而不是当前session的用户
          // 应该使用的是initConfig获取到的数据库的用户名和店铺ID
        }
        if (Utils.isEmpty(config.headers['security-token'])) {
          config.headers['security-token'] = token?.securityToken ?? '';
        }
        config.headers['language'] = this.session?.language ?? 'ZH'; // 后期再考虑翻译吧
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    this.service.interceptors.response.use(
      (response) => {
        return Promise.resolve(response);
      },
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  responseResult(
    targetRequest: Observable<AxiosResponse>,
    respData: AxiosResponse,
  ): Promise<AxiosResponse> {
    const data: CommonResult = respData.data;
    const code = data.code;
    if (!Utils.isEmpty(code)) {
      if (CodeEnum.INVALID_SESSION === code) {
        // 无效的登录,需要重新登录
        return this.loginAction(targetRequest);
      }
    }
    return Promise.resolve(respData);
  }

  private async loginAction(targetRequest: Observable<AxiosResponse>) {
    const publicKey = await this.getPublicKey();
    const tripleKey = crypto.randomBytes(32).toString('hex');
    const iv = crypto.randomBytes(12).toString('hex');
    const triplePassword = Utils.tripleDesEncrypt(
      this.options.password,
      tripleKey,
      iv,
    );
    const tokenParams = {
      accessKey: tripleKey,
      vectorValue: iv,
    };
    await this.httpServiceCacheService.setServiceToken(this.options, {
      securityToken: Utils.rsaPublicEncrypt(
        JSON.stringify(tokenParams),
        publicKey,
      ),
    });
    const loginParams = {
      adminId: this.options.userName,
      adminPws: triplePassword,
    };
    // TODO 这里还缺少重试的次数,报错最多重试3次
    const loginObservable = this.makeObservable(
      this.service.post,
      '/cms/api/user/login',
      loginParams,
    );
    const [err, result] = await Utils.toPromise(
      firstValueFrom(loginObservable),
    );
    if (err) {
      return Promise.reject(err);
    }
    const respData = result.data;
    if (CodeEnum.SUCCESS !== respData.code) {
      // TODO 这个错误需要重新思考处理,如果密码错误时
      return Promise.reject(result);
    }
    await this.httpServiceCacheService.setServiceToken(this.options, {
      credential: result.data['credential'],
    });
    return this.requestToPromise(targetRequest);
  }

  private async getPublicKey() {
    const serviceToken = await this.httpServiceCacheService.getServiceToken(
      this.options,
    );
    let publicKey = serviceToken?.publicKey ?? '';
    if (Utils.isEmpty(publicKey)) {
      const publicKeyObservable = this.makeObservable(
        this.service.get,
        '/cms/api/user/publicKey',
        {},
      );
      const [err, result] = await Utils.toPromise(
        firstValueFrom(publicKeyObservable),
      );
      if (err) {
        return '';
      }
      publicKey = Utils.base64ToString(result.data['publicKey']);
      await this.httpServiceCacheService.setServiceToken(this.options, {
        publicKey,
      });
    }
    return publicKey;
  }
}
