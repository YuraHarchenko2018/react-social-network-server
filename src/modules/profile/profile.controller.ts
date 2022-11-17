import {
  Bind,
  Body,
  Param,
  Request,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
import { SetStatusDto } from './dto/set-status-dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:id')
  async findUserData(@Param() param): Promise<Array<object>> {
    return await this.profileService.find(param.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/status')
  @Bind(Request(), Body())
  async setStatus(req, body: SetStatusDto) {
    const userId = req.user.userId;
    const newStatus = body.status;
    const result = await this.profileService.updateUserStatus(
      userId,
      newStatus,
    );
    return {
      statusCode: result ? 200 : 400,
      message: result ? 'Success' : 'Bad Request',
    };
  }
}
