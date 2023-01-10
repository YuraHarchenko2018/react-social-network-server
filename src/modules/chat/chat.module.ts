import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { User } from '../users/model/user.entity';
import { Messages } from './model/messages.entity';
import { Chat } from './model/chat.entity';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    TypeOrmModule.forFeature([User, Messages, Chat]),
  ],
  providers: [ChatGateway, ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
