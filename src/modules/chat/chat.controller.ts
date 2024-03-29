import {
  Controller,
  UseGuards,
  Post,
  Bind,
  Body,
  Request,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/passport/guards/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create')
  @Bind(Request(), Body())
  async createChat(req, body) {
    const userId: number = req.user.userId;
    const friendId: number = body.friendId;

    if (!!userId && !!friendId) {
      const newChatId: number = await this.chatService.createChat();

      const friendResult: boolean = await this.chatService.addUserToChat(
        newChatId,
        userId,
      );
      const userResult: boolean = await this.chatService.addUserToChat(
        newChatId,
        friendId,
      );

      return {
        status: friendResult && userResult,
        chatId: newChatId,
      };
    }

    return {
      status: false,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('dialogs')
  @Bind(Request())
  async getDialogs(req) {
    const userId = req.user.userId;
    const chats = await this.chatService.getUserChats(userId);
    const chatsUsers = await this.chatService.getChatsUsers(chats, userId);
    return chatsUsers;
  }

  @UseGuards(JwtAuthGuard)
  @Get('messages/:chatId')
  @Bind(Request(), Param(), Query())
  async getMessages(req, param, query) {
    const currentPage = query.page ?? 1;
    const perPage = query.perPage ?? 30;

    const userId = req.user.userId;
    const chatId = +param.chatId;

    const isUserInChat = await this.chatService.isUserInChat(userId, chatId);

    if (isUserInChat) {
      const messages = await this.chatService.getChatMessages(
        currentPage,
        perPage,
        chatId,
      );
      return messages;
    }

    return [];
  }
}
