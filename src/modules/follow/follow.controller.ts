import {
  Bind,
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
import { FollowService } from './follow.service';

@Controller()
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  @UseGuards(JwtAuthGuard)
  @Post('follow')
  @Bind(Request(), Body())
  async follow(req, body): Promise<boolean> {
    const userId = req.user.userId;
    const followId = body.followId;
    let insertResult = await this.followService.follow(userId, followId);
    let result = insertResult.raw.affectedRows > 0 ? true : false;
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Post('unfollow')
  @Bind(Request(), Body())
  async unfollow(req, body): Promise<boolean> {
    const userId = req.user.userId;
    const followId = body.followId;
    let insertResult = await this.followService.unfollow(userId, followId);
    let result = insertResult.affected > 0 ? true : false;
    return result;
  }
}
