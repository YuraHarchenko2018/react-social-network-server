import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConnectableObservable } from 'rxjs';
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
    if (!userId || !postId) {
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

        if (isLikeWasSet) {
          const likeObjWithId = insertResult.identifiers[0];
          const likeData = {
            ...likeObjWithId,
            user: {
              id: userId,
            },
          };

          return {
            status: isLikeWasSet,
            message: isLikeWasSet ? 'Succes' : 'error',
            likeData: likeData,
          };
        } else {
          throw new Error('isLikeWasSet error');
        }
      } catch (error) {
        return {
          status: false,
          message: 'Post is not exist.',
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
    const posts: Posts[] = await this.postsRepository.find({
      order: { id: 'DESC' },
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

  async findOne(postId): Promise<Posts> {
    const post: Posts = await this.postsRepository.findOne({
      where: {
        id: postId,
      },
      relations: {
        user: true,
        likes: {
          user: true,
        },
      },
    });

    post['likesCount'] = post.likes.length;
    return post;
  }

  async getPostsAmount(): Promise<object> {
    const postsTotalCount: number = await this.postsRepository.count();
    return { postsTotalCount };
  }

  async findByUserId(userId): Promise<User> {
    const me: User = await this.usersRepository.findOne({
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
    const insertResult = await this.postsRepository.insert(insertParams);
    const isSuccess = insertResult.raw.affectedRows > 0 ? true : false;
    const insertedPostId = insertResult.raw.insertId;
    if (isSuccess) {
      const post = await this.findOne(insertedPostId);
      return {
        post: post,
        status: true,
      };
    }
    return {
      status: false,
    };
  }

  async updatePost(userId, postId, postText) {
    const updateResult = await this.postsRepository.update(
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
    // first clear likes
    await this.postLikesRepository.delete({
      posts: { id: postId },
    });

    // then delete post
    const deleteResult = await this.postsRepository.delete({
      id: postId,
      userId: authUserId,
    });
    return deleteResult;
  }
}
