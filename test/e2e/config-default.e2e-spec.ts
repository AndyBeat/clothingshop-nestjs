import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ConfigService } from '../../src/common/config';

describe('ConfigService 默认加载', () => {
  let service: ConfigService
  let app: INestApplication;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule.loadDefault()],
    }).compile();
    app = module.createNestApplication();
    await app.init();
    service = app.get<ConfigService>(ConfigService);
  });

  it(`ConfigService初始化`, () => {
    expect(service).toBeDefined();
    expect(service.get<number>('PORT')).toBe(5000)
    expect(service.get<string>('undefined')).toBe(undefined)
    expect(service.get<boolean>('isShow')).toBe(true)
    expect(service.get<string>('isString')).toBe('Hello')
  });

  afterEach(async () => {
  });
});
