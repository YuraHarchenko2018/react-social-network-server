import {
  Bind,
  Controller,
  Get,
  Request,
  UseGuards,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
import { User } from '../users/model/user.entity';
import { Posts } from './model/posts.entity';
import { PostsService } from './posts.service';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('posts/set/like')
  @Bind(Request(), Body())
  async setPostLike(req, body) {
    const userId = req.user.userId;
    const postId = +body.postId;
    const setLikeResult = await this.postsService.setPostLike(userId, postId);
    return setLikeResult;
  }

  @Get('posts')
  async findAll(@Query() query): Promise<Posts[]> {
    const postsPage = +query.page || 1;
    const perPage = +query.perPage || 100;

    return await this.postsService.findAll(postsPage, perPage);
  }

  @Get('posts/amount')
  async getPostsAmount(): Promise<object> {
    return await this.postsService.getPostsAmount();
  }

  @Get('posts/:id')
  @Bind(Param())
  async findById(param): Promise<User> {
    return await this.postsService.findByUserId(param.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  @Bind(Request(), Body())
  async addPost(req, body): Promise<any> {
    const userId = req.user.userId;
    const text = body.text;
    const result = await this.postsService.addPost(userId, text);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  @Bind(Request(), Param())
  async deletePost(req, param): Promise<any> {
    const authUserId = req.user.userId;
    const postId = +param.id;
    const deleteResult = await this.postsService.deletePost(authUserId, postId);
    const result = deleteResult.affected > 0 ? true : false;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('posts')
  @Bind(Request(), Body())
  async updatePost(req, body) {
    const authUserId = req.user.userId;
    const postId = +body.id;
    const postText = body.text;

    const updateResult = await this.postsService.updatePost(
      authUserId,
      postId,
      postText,
    );
    return updateResult;
  }
}
