import {
  Bind,
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
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
}
