import { Controller, Body, Post } from '@nestjs/common';
import RegistrationService from './registration.service';
import { AddUserDto } from '../users/dto/add-user.dto';

@Controller('/registration')
export class RegistrationController {
  constructor(private readonly registrationService: RegistrationService) {}

  @Post()
  postRegistration(@Body() addUserDto: AddUserDto): any {
    return this.registrationService.registration(addUserDto);
  }
}
