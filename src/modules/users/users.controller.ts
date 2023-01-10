import {
  Bind,
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
import { User } from './model/user.entity';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Bind(Request(), Query())
  async findAll(req, query): Promise<Array<object>> {
    return await this.usersService.findAll(query, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/search')
  @Bind(Request(), Query())
  async searchUsers(req, query): Promise<Array<object>> {
    const searchParam = query.search;
    return await this.usersService.searchUsers(searchParam, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/friends')
  @Bind(Request(), Query())
  async findFriends(req, query): Promise<User[]> {
    return await this.usersService.findFriends(query, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/friends/search')
  @Bind(Request(), Query())
  async searchFriends(req, query): Promise<Array<object>> {
    const searchParam = query.search;
    return await this.usersService.searchFriends(searchParam, req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/updateInfo')
  @UseInterceptors(FileInterceptor('avatar'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body() body,
  ) {
    // create thunk on frontend
    const userName = body.userName ?? null;
    const userAge = body.userAge ?? null;
    return await this.usersService.updateUserInfo(
      req.user.userId,
      file,
      userName,
      userAge,
    );
  }
}
