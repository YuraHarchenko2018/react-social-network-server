import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';

/**
 * Interface for @AuthService class
 */
export interface IAuthService {
  usersService: UsersService;
  jwtService: JwtService;

  // constructor(usersService: UsersService, jwtService: JwtService): void;
  validateUser(email: string, pass: string): Promise<any>;
  login(user): Promise<any>;
  checkJwtToken(token): any;
}
