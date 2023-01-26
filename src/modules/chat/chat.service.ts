import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from '../users/model/user.entity';
import { Chat } from './model/chat.entity';
import { Messages } from './model/messages.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Messages)
    private messagesRepository: Repository<Messages>,
    @InjectRepository(Chat)
    private chatRepository: Repository<Chat>,
  ) {}

  async findFriends({ page, count }, userId: number): Promise<any> {
    const currentPage = page ?? 1;
    const perPage = count ?? 5;

    const myFollowingId = await this.getMyFollowingIds(userId);
    const usersTotalCount: number = await this.usersRepository.count({
      where: {
        id: In(myFollowingId),
      },
    });

    const users: User[] = await this.usersRepository.find({
      select: ['id', 'name', 'avatarImg'],
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

  async getMyFollowingIds(userId: number) {
    const me: User = await this.usersRepository.findOne({
      select: ['id'],
      where: { id: userId },
      relations: { follow: true },
    });
    const myFollows = me.follow.map((row) => row.followId);
    return myFollows;
  }

  async createChat(): Promise<number> {
    const addChatResult = await this.chatRepository.insert({});
    const newChatId = addChatResult.raw.insertId;
    return newChatId;
  }

  async addUserToChat(chatId: number, userId: number): Promise<boolean> {
    const findChatOption = {
      where: {
        id: chatId,
      },
    };

    const findUserOption = {
      where: {
        id: userId,
      },
      relations: {
        chat: true,
      },
    };

    const user = await this.usersRepository.findOne(findUserOption);
    const newChat = await this.chatRepository.findOne(findChatOption);

    if (user) {
      user.chat = [...user.chat, newChat];

      const toUpdate = await this.usersRepository.preload(user);
      const result = this.usersRepository.save(toUpdate);
      return !!result;
    }

    return false;
  }

  async getUserChats(userId: number) {
    const user = await this.usersRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        chat: true,
      },
    });
    return user.chat;
  }

  async addMessage(senderId: number, text: string, chatId: number) {
    const chat = await this.chatRepository.findOne({
      where: {
        id: chatId,
      },
    });

    const addResult = await this.messagesRepository.insert({
      senderId,
      chat,
      text,
    });

    const messageId = addResult.raw.insertId;

    const message = this.messagesRepository.findOne({
      where: {
        id: messageId,
      },
      relations: {
        chat: true,
      },
    });

    return message;
  }

  async isUserInChat(userId: number, chatId: number) {
    const chats: Chat[] = await this.getUserChats(userId);
    const userChatIds = chats.map((chat) => chat.id);
    const result = userChatIds.some((userChatId) => userChatId === chatId);
    return result;
  }

  async getChatMessages(currentPage: number, perPage: number, chatId: number) {
    const chat = await this.chatRepository.findOne({ where: { id: chatId } });
    const chatMessages = await this.messagesRepository.find({
      where: {
        chat: chat,
      },
      skip: perPage * currentPage - perPage,
      take: perPage,
      order: { id: 'DESC' },
    });

    return chatMessages;
  }

  async getChatsUsers(chats: Chat[], asksUserId: number) {
    const chatIds = chats.map((chat) => chat.id);
    const chatsUsers = await this.usersRepository.find({
      select: {
        id: true,
        name: true,
        avatarImg: true,
        chat: {
          id: true,
        },
      },
      where: {
        id: Not(asksUserId),
        chat: {
          id: In(chatIds),
        },
      },
      relations: {
        chat: true,
      },
    });
    return chatsUsers;
  }

  async getChatPenPal(chatId: number, asksUserId: number) {
    const chatUsers = await this.usersRepository.find({
      where: {
        id: Not(asksUserId),
        chat: {
          id: chatId,
        },
      },
    });
    return chatUsers;
  }
}
