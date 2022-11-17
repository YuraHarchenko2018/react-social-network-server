import { Injectable, Dependencies } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { User } from '../users/model/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@Dependencies(UsersService, JwtService)
export class AuthService {
  usersService: UsersService;
  jwtService: JwtService;

  constructor(usersService: UsersService, jwtService: JwtService) {
    this.usersService = usersService;
    this.jwtService = jwtService;
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const isEmailValid: boolean = await this.usersService.loginValidationEmail(
      email,
    );

    if (!isEmailValid) {
      return;
    }

    const user: User = await this.usersService.findByEmail(email);
    const isPasswordCorrect: boolean = await this.usersService.checkPassword(
      pass,
      user.password,
    );

    if (isPasswordCorrect) {
      const { password, ...result } = user;
      return result;
    }

    return;
  }

  async login(user): Promise<any> {
    const payload = {
      name: user.name,
      sub: user.id,
      email: user.email,
      age: user.age,
    };

    return {
      access_token: this.jwtService.sign(payload),
      metadata: payload,
    };
  }
}
