import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  Injectable,
  UnauthorizedException,
  Dependencies,
} from '@nestjs/common';
import { IAuthService } from '../../interfaces/auth.service.interface';
import { AuthService } from '../../auth.service';

@Injectable()
@Dependencies(AuthService)
export class LocalStrategy extends PassportStrategy(Strategy) {
  authService: IAuthService;

  constructor(authService) {
    super({ usernameField: 'email' });
    this.authService = authService;
  }

  async validate(email, password) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
