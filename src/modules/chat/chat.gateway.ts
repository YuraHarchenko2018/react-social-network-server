import {
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  WebSocketGateway,
} from '@nestjs/websockets';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() messageBody): void {
    this.server.emit('message', messageBody);
  }
}
