import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, InsertResult, Repository } from 'typeorm';
import { Follow } from './model/follow.entity';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private followRepository: Repository<Follow>,
  ) {}

  async follow(userId, followId): Promise<InsertResult> {
    const insertParams = { userId, followId };
    let addingResult = await this.followRepository.insert(insertParams);
    return addingResult;
  }

  async unfollow(userId, followId): Promise<DeleteResult> {
    const deleteParams = { userId, followId };
    let deletingResult = await this.followRepository.delete(deleteParams);
    return deletingResult;
  }
}
