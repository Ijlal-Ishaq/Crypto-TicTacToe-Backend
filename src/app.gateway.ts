/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-empty-function */

import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { AppService } from './app.service';

@WebSocketGateway()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly appService: AppService) {}

  @WebSocketServer() server: Server;

  @SubscribeMessage('join')
  async handleTopCurrencies(client: any, address: string) {
    const key = await this.appService.goOnline(address, client.id);
    if (key !== 'error') {
      this.server.to(client.id).emit('joined', key);
    }
  }

  handleDisconnect(client: Socket) {
    this.appService.goOffline(client.id);
  }
  handleConnection(client: Socket, ...args: any[]) {}
}
