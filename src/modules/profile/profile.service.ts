import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/model/user.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async find(userId) {
    let users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'age', 'status', 'avatarImg'],
      where: { id: userId },
    });

    return users;
  }

  async updateUserStatus(userId, newStatus) {
    let updateResult = await this.usersRepository.update(
      {
        id: userId,
      },
      {
        status: newStatus,
      },
    );
    return updateResult.affected > 0 ? true : false;
  }
}
