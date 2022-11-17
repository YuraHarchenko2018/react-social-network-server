import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/model/user.entity';
import { PostLikes } from './model/post-likes.entity';
import { Posts } from './model/posts.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Posts)
    private postsRepository: Repository<Posts>,
    @InjectRepository(PostLikes)
    private postLikesRepository: Repository<PostLikes>,
  ) {}

  async setPostLike(userId, postId) {
    if (!userId && !postId) {
      return {
        status: false,
        message: 'user or post id has incorrect value',
      };
    }

    const getResult = await this.postLikesRepository.findOne({
      where: {
        user: { id: userId },
        posts: { id: postId },
      },
    });
    const isAbleToLike = !getResult;

    if (isAbleToLike) {
      try {
        const insertResult = await this.postLikesRepository.insert({
          user: userId,
          posts: postId,
        });
        const isLikeWasSet = insertResult.raw.affectedRows > 0 ? true : false;
        return {
          status: isLikeWasSet,
          message: isLikeWasSet ? 'Succes' : 'error',
        };
      } catch (error) {
        return {
          status: false,
          message: 'Post is not exist',
        };
      }
    } else {
      const deleteResult = await this.postLikesRepository.delete({
        user: { id: userId },
        posts: { id: postId },
      });
      const isDeleted = deleteResult.affected > 0 ? true : false;

      return {
        status: isDeleted,
        message: isDeleted
          ? 'Like was unset'
          : 'No one like was found in the table',
      };
    }
  }

  async findAll(postsPage, perPage): Promise<Posts[]> {
    let posts: Posts[] = await this.postsRepository.find({
      order: { id: 'ASC' },
      skip: perPage * postsPage - perPage,
      take: perPage,
      relations: {
        user: true,
        likes: {
          user: true,
        },
      },
    });

    posts.map((post) => (post['likesCount'] = post.likes.length));

    return posts;
  }

  async findByUserId(userId): Promise<User> {
    let me: User = await this.usersRepository.findOne({
      select: {
        id: true,
        posts: {
          id: true,
          userId: true,
          text: true,
          created_at: true,
          updated_at: true,
          likes: {
            id: true,
            user: {
              id: true,
            },
          },
        },
      },
      where: { id: userId },
      relations: {
        posts: {
          likes: { user: true },
          user: true,
        },
      },
    });

    me.posts.map((post) => (post['likesCount'] = post.likes.length));

    return me;
  }

  async addPost(userId, text) {
    const insertParams = { userId, text };
    let addingResult = await this.postsRepository.insert(insertParams);
    return addingResult;
  }

  async updatePost(userId, postId, postText) {
    let updateResult = await this.postsRepository.update(
      {
        id: postId,
        userId: userId,
      },
      {
        text: postText,
      },
    );
    const result = updateResult.affected > 0 ? true : false;

    return {
      status: result,
      postId: postId,
      newPostText: postText,
    };
  }

  async deletePost(authUserId, postId) {
    let deleteResult = await this.postsRepository.delete({
      id: postId,
      userId: authUserId,
    });
    return deleteResult;
  }
}
