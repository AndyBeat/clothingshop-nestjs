import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { MemoryCacheModule } from '@/cache/modules';
import { AdminSchemaModule, SystemDataSchemaModule } from '@/entities/modules';
// import { ConfigModule } from '../common';
// import { UserModule } from '../user/user.module';
import { TestService } from './test.service';
import { AnimalFactoryModule } from '@/test/abstract';

@Module({
  imports: [
    // ConfigModule.register({
    //   envFilePath: './config/config2.ini',
    //   isWatch: true,
    //   token: 'TEST_CONFIG',
    // }),
    // UserModule,
    AdminSchemaModule,
    MemoryCacheModule,
    SystemDataSchemaModule,
    AnimalFactoryModule,
  ],
  controllers: [TestController],
  providers: [TestService],
})
export class TestModule {}
