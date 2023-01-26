import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, InsertResult, ILike, Repository } from 'typeorm';
import { User } from './model/user.entity';
import * as bcrypt from 'bcrypt';
import { is_email_valid } from 'node-email-validation';
import { AddUserDto } from './dto/add-user.dto';
import { writeFileSync } from 'fs';
import { randomUUID } from 'node:crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async loginValidationEmail(email: string): Promise<boolean> {
    // check on valid email
    const isEmailValid: boolean = is_email_valid(email);
    if (!isEmailValid) {
      return false;
    }

    // check on exists
    const user = await this.findByEmail(email);
    if (!user) {
      return false;
    }

    return true;
  }

  async signupValidationEmail(email: string): Promise<boolean> {
    // check on valid email
    const isEmailValid: boolean = is_email_valid(email);
    if (!isEmailValid) {
      return false;
    }

    // check on exists
    const user = await this.findByEmail(email);
    if (user) {
      return false;
    }

    return true;
  }

  async checkPassword(bodyPassword, userPassword): Promise<boolean> {
    const validPassword = await bcrypt.compare(bodyPassword, userPassword);
    return validPassword;
  }

  addUser(addUserDto: AddUserDto): Promise<InsertResult> {
    return this.usersRepository.insert(addUserDto);
  }

  async findFriends({ page, count }, userId): Promise<any> {
    const currentPage = page ?? 1;
    const perPage = count ?? 5;

    const myFollowingId = await this.getMyFollowingIds(userId);
    const usersTotalCount: number = await this.usersRepository.count({
      where: {
        id: In(myFollowingId),
      },
    });

    const users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'age', 'status', 'avatarImg'],
      order: { id: 'ASC' },
      skip: perPage * currentPage - perPage,
      take: perPage,
      where: {
        id: In(myFollowingId),
      },
    });

    return {
      users: users,
      totalCount: usersTotalCount,
    };
  }

  async searchUsers(searchParam, userId) {
    const myFollowingId = await this.getMyFollowingIds(userId);

    const users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'age', 'status', 'avatarImg'],
      order: { id: 'ASC' },
      where: {
        name: ILike(`%${searchParam}%`),
      },
    });

    const usersWithFollowColumn = users.map((user) => {
      user.isFollow = myFollowingId.some((followId) => followId === user.id);
      return user;
    });

    return [
      {
        users: usersWithFollowColumn,
      },
    ];
  }

  async searchFriends(searchParam, userId) {
    const myFollowingId = await this.getMyFollowingIds(userId);

    const users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'age', 'status', 'avatarImg'],
      order: { id: 'ASC' },
      where: {
        id: In(myFollowingId),
        name: ILike(`%${searchParam}%`),
      },
    });

    return [
      {
        users: users,
      },
    ];
  }

  async findAll({ count, page }, userId = 1) {
    const usersCount = count ?? 5;
    const usersPage = page ?? 1;

    const usersTotalCount: number = await this.usersRepository.count();
    const myFollowingId = await this.getMyFollowingIds(userId);

    const users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'email', 'age', 'status', 'avatarImg'],
      order: { id: 'ASC' },
      skip: usersCount * usersPage - usersCount,
      take: usersCount,
    });

    const usersWithFollowColumn = users.map((user) => {
      user.isFollow = myFollowingId.some((followId) => followId === user.id);
      return user;
    });

    return [
      {
        users: usersWithFollowColumn,
        totalCount: usersTotalCount,
        page: usersPage,
      },
    ];
  }

  async getMyFollowingIds(userId) {
    const me: User = await this.usersRepository.findOne({
      select: ['id'],
      where: { id: userId },
      relations: { follow: true },
    });
    const myFollows = me.follow.map((row) => row.followId);
    return myFollows;
  }

  findById(userId: number): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        id: userId,
      },
    });
  }

  findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email: email,
      },
    });
  }

  async updateUserInfo(userId, newAvatar, userNameToUpdate, userAgeToUpdate) {
    type ToUpdateObjType = {
      avatarImg?: string;
      name?: string;
      age?: number;
    };

    const toUpdate: ToUpdateObjType = {};
    const salt = randomUUID();

    if (newAvatar) {
      const fileName = salt + '_' + newAvatar.originalname;
      const filePath = 'src/assets/avatars/' + fileName;

      writeFileSync(filePath, newAvatar.buffer);
      toUpdate.avatarImg = '/assets/' + fileName;
    }

    if (userNameToUpdate) {
      toUpdate.name = userNameToUpdate;
    }

    if (userAgeToUpdate) {
      toUpdate.age = +userAgeToUpdate;
    }

    const updateResult = await this.usersRepository.update(
      {
        id: userId,
      },
      toUpdate,
    );

    const result = updateResult.affected > 0 ? true : false;
    return result;
  }
}
