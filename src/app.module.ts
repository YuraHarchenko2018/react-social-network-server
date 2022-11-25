import { AuthModule } from './modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';

import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './modules/users/model/user.entity';
import { ProfileModule } from './modules/profile/profile.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { Follow } from './modules/follow/model/follow.entity';
import { FollowModule } from './modules/follow/follow.module';
import { PostsModule } from './modules/posts/posts.module';
import { Posts } from './modules/posts/model/posts.entity';
import { PostLikes } from './modules/posts/model/post-likes.entity';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.MYSQL_HOST ?? 'localhost',
      port: Number(process.env.MYSQL_PORT) ?? 3306,
      username: process.env.MYSQL_USER ?? 'root',
      password: process.env.MYSQL_PASSWORD ?? '12345678',
      database: process.env.MYSQL_DATABASE ?? 'it-kamasutra',
      entities: [User, Follow, Posts, PostLikes],
      charset: 'utf8mb4_unicode_ci',
      // migrationsTableName: "migrations",
      synchronize: true,
    }),
    UsersModule,
    FollowModule,
    PostsModule,
    ProfileModule,
    RegistrationModule,
    ChatModule,
    // AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
