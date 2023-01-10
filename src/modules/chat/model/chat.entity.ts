import { Messages } from './messages.entity';
import { Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Chat {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToMany(() => Messages, (messages) => messages.chat)
  messages: Messages[];
}
