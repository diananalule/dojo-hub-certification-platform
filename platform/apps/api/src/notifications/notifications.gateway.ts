import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

interface AccessTokenPayload {
  sub: string;
  role: string;
}

interface SocketData {
  userId?: string;
}

type AppSocket = Socket<
  Record<string, never>,
  Record<string, never>,
  Record<string, never>,
  SocketData
>;

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: '/realtime',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: AppSocket) {
    try {
      // access_token is httpOnly, so the browser attaches it automatically on the
      // WebSocket handshake request; it's never readable by client-side JS.
      const rawCookieHeader = client.handshake.headers?.cookie;
      const cookies = rawCookieHeader ? cookie.parse(rawCookieHeader) : {};
      const authHeader = client.handshake.headers?.authorization;
      const token: string | undefined =
        cookies['access_token'] ||
        (client.handshake.auth?.token as string | undefined) ||
        authHeader?.toString().replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify<AccessTokenPayload>(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      client.data.userId = payload.sub;
      void client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: AppSocket) {
    const userId = client.data?.userId;
    if (userId) {
      void client.leave(`user:${userId}`);
    }
  }

  emitToUser(userId: string, event: string, payload: unknown) {
    this.server.to(`user:${userId}`).emit(event, payload);
  }
}
