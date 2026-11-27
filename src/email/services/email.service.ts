/**
 * Create by oliver.wu 2026/11/23
 * 邮件发送服务:基于 nodemailer 封装 SMTP 发信能力
 * 支持两种正文来源:传 template 时复用 EmailUtils 渲染 ejs + i18n,否则直接使用 html
 */
import { Injectable } from '@nestjs/common';
import {
  createTransport,
  SMTPSentMessageInfo,
  SMTPTransportOptions,
  Transporter,
} from 'nodemailer';

import { EmailConfig, RawEmailConfig } from '../types';
import { ReqEmailDto } from '../dto';
import { EmailUtils } from '../email.utils';
import { Utils } from '@/common/utils';
import { CodeException } from '@/common/exceptions';
import { CodeEnum } from '@/common/enum';
import { AopLogger } from '@/logger';
import dns from 'node:dns';
import { postForm } from 'axios';

/** 隐式 TLS(SSL)端口,该端口需要 secure=true,其余端口由 nodemailer 自动协商 STARTTLS */
const SMTP_SSL_PORT = 465;
/** 配置缺失或非法时回退使用的标准 SMTP 端口 */
const DEFAULT_SMTP_PORT = 25;

@Injectable()
export class EmailService {
  private readonly transporter: Transporter<
    SMTPSentMessageInfo,
    SMTPTransportOptions
  >;
  private readonly emailConfig: EmailConfig;

  private readonly logger = new AopLogger(EmailService.name);

  constructor(
    emailConfig: EmailConfig,
    private readonly emailUtils: EmailUtils,
  ) {
    this.emailConfig = emailConfig;
    // createTransport 只构造连接器不会立刻建连,SMTP 不可用不会影响服务启动
    this.transporter = createTransport(
      this.createTransportOptions(emailConfig),
    );
  }

  /**
   * 验证 SMTP 连接是否可用(实际建立连接并认证后立即断开),失败抛出业务异常
   */
  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}SMTP 连接验证失败: ${Utils.errMessage(err)}`,
      );
    }
    this.logger.log(
      `${this.getClientName()}SMTP 连接验证成功: ${this.emailConfig.smtpAddress}:${this.emailConfig.smtpPort}`,
    );
    return true;
  }

  /**
   * 发送邮件
   * @param info 邮件内容,template 与 html 二选一,template 优先
   * @returns nodemailer 的发送结果信息(messageId / response / accepted 等)
   */
  async sendMail(info: ReqEmailDto): Promise<SMTPSentMessageInfo> {
    const to = this.checkRecipient(info.to);
    const html = this.resolveHtml(info);
    let result: SMTPSentMessageInfo;
    try {
      result = await this.transporter.sendMail({
        from: this.emailConfig.smtpSender,
        to,
        subject: info.subject,
        html,
      });
    } catch (err) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        `${this.getClientName()}发送邮件失败: ${Utils.errMessage(err)}`,
      );
    }
    this.logger.log(
      `${this.getClientName()}邮件发送成功: to=${to.join(',')}, subject=${info.subject}, messageId=${result.messageId}`,
    );
    return result;
  }

  /**
   * 关闭传输连接(模块销毁时调用)
   */
  close(): void {
    this.transporter.close();
  }

  getClientName() {
    return `[EMAIL] 发信服务(${this.emailConfig.smtpSender}) `;
  }

  /**
   * 校验收件人并统一规整为去空、去重后的数组
   */
  private checkRecipient(to: string[] | string): string[] {
    const list = (Array.isArray(to) ? to : [to])
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter((item) => item.length > 0);
    if (list.length === 0) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        '收件人邮箱地址(to)必填且需为非空字符串或字符串数组',
      );
    }
    return [...new Set(list)];
  }

  /**
   * 解析邮件正文:传了 template 则用 EmailUtils 渲染,否则直接使用 html
   */
  private resolveHtml(info: ReqEmailDto): string {
    if (!Utils.isEmpty(info.template)) {
      // language 未传时由 EmailUtils 内部默认按中文渲染
      return this.emailUtils.getEmailTemplate(
        info.template,
        info.options ?? {},
        info.language,
      );
    }
    if (Utils.isEmpty(info.html)) {
      throw new CodeException(
        CodeEnum.EXCEPTION,
        'template 与 html 至少需要提供一个',
      );
    }
    return info.html;
  }

  /**
   * 根据邮箱配置组装 nodemailer SMTP 连接参数
   */
  private createTransportOptions(config: EmailConfig): SMTPTransportOptions {
    return {
      host: config.smtpAddress,
      port: config.smtpPort,
      secure: config.smtpPort === SMTP_SSL_PORT,
      // 未配置密码时不传 auth,兼容内网免认证的 SMTP 中继
      ...(Utils.isEmpty(config.smtpPassword)
        ? {}
        : { auth: { user: config.smtpSender, pass: config.smtpPassword } }),
    };
  }

  /** 从发件邮箱域名推导 SMTP 主机；域名未登记时报错并提示手动补充映射表 */
  public resolveSmtpHost(sender: string) {
    /** 邮箱域名 → SMTP 主机映射表：新增邮箱商时在这里加一行即可 */
    const HOST_MAP = {
      'qq.com': 'smtp.qq.com',
      '163.com': 'smtp.163.com',
      '126.com': 'smtp.126.com',
      'exmail.qq.com': 'smtp.exmail.qq.com', // 腾讯企业邮
    };
    const domain = (sender.split('@')[1] || '').toLowerCase();
    // 腾讯企业邮自有域名没有固定后缀，只认 exmail 字样，其余交给映射表
    const host = domain.includes('exmail')
      ? HOST_MAP['exmail.qq.com']
      : HOST_MAP[domain];
    if (!host) {
      throw new Error(
        `无法识别邮箱域名「${domain || '空'}」对应的 SMTP 主机，请在上面的 HOST_MAP 中手动加一行，` +
          `例如腾讯企业邮自有域名：'你的域名': 'smtp.exmail.qq.com'`,
      );
    }
    return host;
  }

  /**
   * 用操作系统解析器（getaddrinfo）把 SMTP 主机解析成真实 IP。
   * nodemailer 自带解析走 dns.resolve4（直接询问 DNS 服务器），在开启
   * fake-ip 的代理环境下会拿到 198.18.x.x 这类不可路由的假地址，表现为
   * connect ETIMEDOUT；系统解析器（dns.lookup）返回的是真实地址。
   * 解析失败时原样返回域名，交给 nodemailer 自己处理并报错。
   */
  public async lookupHostAddress(hostname: string) {
    // 例子
    /**
     * const hostName = resolveSmtpHost(config.smtpAddress);
     * const address = await lookupHostAddress(hostName);
     *
     * return nodemailer.createTransport({
     *     host: address,
     *     port: 465,
     *     secure: true,
     *     // host 是 IP 时 nodemailer 不会自动设置 SNI，必须显式指定域名用于证书校验
     *     servername: hostName,
     *     auth: { user: SENDER, pass: AUTH_CODE },
     *   });
     */
    try {
      const { address } = await dns.promises
        .lookup(hostname, { family: 4 })
        .catch(() => dns.promises.lookup(hostname));
      return address;
    } catch (err) {
      console.warn(
        `[警告] 系统解析器无法解析 ${hostname}（${err.code || err.message}），改用 nodemailer 自带解析。`,
      );
      return hostname;
    }
  }

  /**
   * 关于OAuth2验证方式,没有账号测试
   */
  async getClientCredentialsToken() {
    /** 租户 ID：客户端凭证流必须是具体租户 ID: Directory (tenant) ID */
    const TENANT_ID = '********-****-****-****-************';
    /** Azure 应用（客户端）ID：Entra ID → 应用注册 → 概述页: Application (client) ID */
    const CLIENT_ID = '********-****-****-****-************';
    /** 客户端密钥（客户端凭证流必填）：应用注册 → 证书和密码 → 新建客户端密码 → 复制「值」列（不是Secret ID） */
    const CLIENT_SECRET = '********-****-****-****-************';
    /** 微软 OAuth2 v2.0 端点前缀 */
    const TOKEN_BASE = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0`;
    /**
     * 应用权限 scope：微软官方明确 client_credentials 必须用 https://outlook.office365.com/.default
     * （/.default 代表「应用注册里已授予管理员同意的全部应用权限」，不能写成 SMTP.Send 这类委托权限）
     */
    const SMTP_TOKEN_SCOPE = 'https://outlook.office365.com/.default';
    const response = await postForm(`${TOKEN_BASE}/token`, {
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      scope: SMTP_TOKEN_SCOPE,
    });
    if (!response || typeof response.data.access_token !== 'string') {
      throw new Error('微软令牌端点响应缺少 access_token，无法继续');
    }
    return {
      accessToken: response.data.access_token,
      expiresAt: Date.now() + (Number(response.data.expires_in) || 0) * 1000,
    };
  }

  /**
   * 组装 XOAUTH2 transport。
   * 不传 refreshToken / accessUrl：nodemailer 内置刷新是 Google 风格，这里用 provisionCallback 接管，
   * SMTP 回 334 时直接再走一次客户端凭证流拿新 token。
   * @param {string} hostAddress 系统解析器解析出的真实 IP（解析失败时就是域名本身）
   * @param {{accessToken:string, expiresAt:number}} token 当前可用 token
   */
  buildOAuth2Transport(hostAddress: string, token: Record<string, any>) {
    return createTransport({
      host: hostAddress,
      port: 587,
      secure: false,
      // host 传的是 IP，nodemailer 不会自动设置 SNI，必须显式指定域名做 TLS 证书校验
      servername: 'outlook.office365.com',
      auth: {
        type: 'OAuth2',
        user: this.emailConfig.smtpSender,
        clientId: '********-****-****-****-************',
        clientSecret: this.emailConfig.smtpPassword,
        accessToken: token.accessToken,
        // expires 必须是毫秒时间戳：nodemailer 用 expires > Date.now() 判断缓存是否可用
        expires: token.expiresAt,
        // SMTP 回 334 时 nodemailer 以 renew=true 回调，这里再换一个新 token，它会自动重试一次 AUTH
        provisionCallback: (user, renew, cb) => {
          this.getClientCredentialsToken()
            .then((fresh) => cb(null, fresh.accessToken, fresh.expiresAt))
            .catch(cb);
        },
      },
    });
  }

  async oauth2TestMain() {
    const token = await this.getClientCredentialsToken();
    const minutesLeft = Math.max(
      1,
      Math.round((token.expiresAt - Date.now()) / 60000),
    );
    console.log(`[OK] 已获取应用 token（约 ${minutesLeft} 分钟有效）。`);

    const SMTP_HOST = 'outlook.office365.com';
    const SMTP_PORT = 587;
    const address = await this.lookupHostAddress(SMTP_HOST);
    console.log(
      `SMTP：${address}:${SMTP_PORT}（STARTTLS + XOAUTH2，client_credentials 应用身份）`,
    );

    const info = await this.buildOAuth2Transport(address, token).sendMail({
      from: `nodemailer-oauth2-demo`,
      to: '',
      subject: '[nodemailer-oauth2-demo] XOAUTH2 发信测试',
      text: `这是一封用 OAuth2（XOAUTH2，客户端凭证流）发出的测试邮件。\n发送时间：${new Date().toLocaleString('zh-CN')}\n`,
    });
    console.log(`[OK] 发送成功！messageId: ${info.messageId}`);
  }
}

/**
 * 将配置中心读取到的原始值规整为 EmailConfig(端口转数字,非法时回退默认端口)
 */
export function normalizeEmailConfig(partial: RawEmailConfig): EmailConfig {
  const port = Number(partial.smtpPort);
  return {
    smtpSender: partial.smtpSender,
    smtpAddress: partial.smtpAddress,
    smtpPassword: partial.smtpPassword,
    smtpPort: port > 0 ? port : DEFAULT_SMTP_PORT,
  };
}
