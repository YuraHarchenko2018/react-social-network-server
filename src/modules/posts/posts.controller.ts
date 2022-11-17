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

  @Get('posts/:id')
  @Bind(Param())
  async findById(param): Promise<User> {
    return await this.postsService.findByUserId(param.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  @Bind(Request(), Body())
  async addPost(req, body): Promise<boolean> {
    const userId = req.user.userId;
    const text = body.text;
    let insertResult = await this.postsService.addPost(userId, text);
    let result = insertResult.raw.affectedRows > 0 ? true : false;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Delete('posts/:id')
  @Bind(Request(), Param())
  async deletePost(req, param): Promise<boolean> {
    const authUserId = req.user.userId;
    const postId = +param.id;
    let deleteResult = await this.postsService.deletePost(authUserId, postId);
    let result = deleteResult.affected > 0 ? true : false;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Patch('posts')
  @Bind(Request(), Body())
  async updatePost(req, body) {
    const authUserId = req.user.userId;
    const postId = +body.id;
    const postText = body.text;

    let updateResult = await this.postsService.updatePost(
      authUserId,
      postId,
      postText,
    );
    return updateResult;
  }
}
