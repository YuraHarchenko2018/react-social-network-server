import { Inject } from '@nestjs/common';
import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  WebSocketGateway,
  ConnectedSocket,
  OnGatewayConnection
} from '@nestjs/websockets';
import { AuthService } from '../auth/auth.service';
import { IAuthService } from '../auth/interfaces/auth.service.interface';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  constructor(@Inject(AuthService) private authService: IAuthService) {}

  @WebSocketServer()
  server;

  handleConnection(connected) {
    const jwtToken = connected.handshake.auth.jwtToken;
    const result = this.authService.chechJwtToken(jwtToken);

    console.log(result);

    this.server.emit('message', {
      senderId: 30,
      senderName: 'Yuri',
      text: 'Connected)',
    });
  }

  @SubscribeMessage('message')
  handleMessage(
    @MessageBody() messageBody,
    @ConnectedSocket() connected,
  ): void {
    console.log(messageBody);
    console.log('id - ' + connected.id);

    const jwtToken = connected.handshake.auth.jwtToken;
    const result = this.authService.chechJwtToken(jwtToken);

    if (result.status) {
      const senderUserId = result.data.sub;
      const senderUsername = result.data.name;

      this.server.emit('message', {
        senderId: senderUserId,
        senderName: senderUsername,
        text: messageBody.text,
      });
    }
  }
}
