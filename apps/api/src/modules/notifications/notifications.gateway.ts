import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://unandnewgame-tan.vercel.app',
      process.env.NEXT_PUBLIC_WEB_URL || '*',
    ],
    credentials: true,
  },
  namespace: '/',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);
  /** Map userId → Set of socket IDs */
  private readonly userSockets = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    // Clean up user–socket mapping
    this.userSockets.forEach((sockets, userId) => {
      sockets.delete(client.id);
      if (sockets.size === 0) this.userSockets.delete(userId);
    });
  }

  /** Client registers their userId after auth */
  @SubscribeMessage('register')
  handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    if (!userId) return;
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId).add(client.id);
    client.join(`user:${userId}`);
    this.logger.log(`User ${userId} registered on socket ${client.id}`);
    return { event: 'registered', data: { userId } };
  }

  /** Send notification to a specific user */
  sendToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }

  /** Broadcast to all connected clients */
  broadcast(event: string, payload: unknown) {
    this.server.emit(event, payload);
  }

  /** Send notification object to user */
  notifyUser(userId: string, notification: {
    type: string;
    title: string;
    message: string;
    data?: Record<string, unknown>;
  }) {
    this.sendToUser(userId, 'notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  /** Emergency broadcast to all users */
  emergencyBroadcast(title: string, message: string, adminId: string) {
    this.broadcast('announcement', {
      type: 'emergency',
      title,
      message,
      adminId,
      timestamp: new Date().toISOString(),
    });
  }
}
