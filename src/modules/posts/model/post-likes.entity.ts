import { Posts } from './posts.entity';
import { User } from 'src/modules/users/model/user.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

@Entity()
export class PostLikes {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Posts, (posts) => posts.likes)
  posts: Posts;

  @ManyToOne(() => User, (user) => user.likes)
  user: User;
}
