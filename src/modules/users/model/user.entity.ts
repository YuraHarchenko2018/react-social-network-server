import { Chat } from './../../chat/model/chat.entity';
import { PostLikes } from '../../posts/model/post-likes.entity';
import { Posts } from 'src/modules/posts/model/posts.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Follow } from '../../follow/model/follow.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 500 })
  password: string;

  @Column({ nullable: true })
  age: number;

  @Column({ type: 'varchar', length: 200, default: '' })
  status: string;

  @Column({ type: 'boolean', default: false })
  isFollow: boolean;

  @OneToMany(() => Follow, (follow) => follow.user)
  follow: Follow[];

  @OneToMany(() => Posts, (posts) => posts.user)
  posts: Posts[];

  @OneToMany(() => PostLikes, (likes) => likes.user)
  likes: PostLikes[];

  @ManyToMany(() => Chat)
  @JoinTable()
  chat: Chat[];

  @Column({
    type: 'varchar',
    length: 1000,
    default: '/default-avatar',
  })
  avatarImg: string;
}
