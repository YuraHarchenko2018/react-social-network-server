import {
  Bind,
  Controller,
  Post,
  UseGuards,
  Request,
  Dependencies,
  Get,
} from '@nestjs/common';
import { LocalAuthGuard } from './passport/guards/local-auth.guard';
import { IAuthService } from './interfaces/auth.service.interface';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './passport/guards/jwt-auth.guard';

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(private readonly authService: IAuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @Bind(Request())
  async login(req: { user: any }) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Bind(Request())
  async me(req: { user: any }) {
    return {
      statusCode: 200,
      message: 'Authorized',
      user: req.user,
    };
  }
}
