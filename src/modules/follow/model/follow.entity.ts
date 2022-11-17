import { User } from 'src/modules/users/model/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  followId: number;

  @ManyToOne(() => User, (user) => user.follow)
  user: User;
}
