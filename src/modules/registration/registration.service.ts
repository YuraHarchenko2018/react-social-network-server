import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { InsertResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from './../users/users.service';

import { AddUserDto } from '../users/dto/add-user.dto';
import { IAuthService } from '../auth/interfaces/auth.service.interface';
import { AuthService } from '../auth/auth.service';

@Injectable()
export default class RegistrationService {
  constructor(
    private usersService: UsersService,
    @Inject(AuthService) private authService: IAuthService,
  ) {}

  async registration(addUserDto: AddUserDto) {
    // Проверять целостность addUserDto где то до контроллера, нужно узнать как это делается в nest
    const name: string = addUserDto.name;
    const email: string = addUserDto.email;
    const age: number = addUserDto.age;
    const password: string = addUserDto.password;

    // valid email
    const isEmailValid: boolean = await this.usersService.signupValidationEmail(
      email,
    );
    if (!isEmailValid) {
      throw new BadRequestException('Incorrect email');
    }

    // hashing password
    const salt: string = await bcrypt.genSalt(10);
    const hashedPassword: string = await bcrypt.hash(password, salt);

    // create data obj for DB insert
    const data: AddUserDto = {
      name: name,
      email: email,
      age: age,
      password: hashedPassword,
    };

    try {
      const result: InsertResult = await this.usersService.addUser(data);

      const userId: number = result.identifiers[0].id;
      const userData = await this.usersService.findById(userId);
      const jwt = this.authService.login(userData);
      return jwt;
    } catch (error) {
      throw new BadRequestException(error.driverError.sqlMessage ?? '');
    }
  }
}
