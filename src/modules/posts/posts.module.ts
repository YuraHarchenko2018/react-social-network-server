import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/model/user.entity';
import { PostLikes } from './model/post-likes.entity';
import { Posts } from './model/posts.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Posts, PostLikes])],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
