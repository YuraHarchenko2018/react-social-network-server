import { Inject } from '@nestjs/common';
import {
  WebSocketServer,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AuthService } from '../auth/auth.service';
import { IAuthService } from '../auth/interfaces/auth.service.interface';
import { ChatService } from './chat.service';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(
    @Inject(AuthService) private authService: IAuthService,
    private readonly chatService: ChatService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const jwtToken = client.handshake.auth.jwtToken;
    const result = this.authService.chechJwtToken(jwtToken);

    if (result.status) {
      const userId = result.data.sub;
      const chats = await this.chatService.getUserChats(userId);
      chats.forEach((chat) => {
        client.join(`CHAT|${chat.id}`);
      });
    }
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, data: any) {
    const jwtToken = client.handshake.auth.jwtToken;
    const result = this.authService.chechJwtToken(jwtToken);

    if (result.status) {
      const senderUserId = result.data.sub;

      const message = await this.chatService.addMessage(
        senderUserId,
        data.text,
        data.chatId,
      );

      this.server.in(`CHAT|${data.chatId}`).emit('message', message);
    }
  }
}
