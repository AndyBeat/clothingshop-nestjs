import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AdminSchemaModule } from 'src/entities/modules';
import { SecretConfigModule } from 'src/common/modules';

@Module({
  imports: [AdminSchemaModule, SecretConfigModule.register()],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
