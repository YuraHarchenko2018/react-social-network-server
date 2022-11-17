import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RegistrationController } from 'src/modules/registration/registration.controller';
import RegistrationService from './registration.service';
import { AuthService } from '../auth/auth.service';
import { AuthModule } from '../auth/auth.module';

import { User } from '../users/model/user.entity'; // 'src/modules/registration/model/user.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), UsersModule, AuthModule],
  exports: [TypeOrmModule],
  controllers: [RegistrationController],
  providers: [RegistrationService, AuthService],
})
export class RegistrationModule {}
