import type { Guild } from '@/modules/guild/guild.repository';
import type { Server, Socket } from 'socket.io';

declare interface ClientToServerEvents {
    ping: () => void;
}

declare interface InterServerEvents {
    ping: () => void;
}

declare interface SocketData {
    user: any;
}

declare global {
    interface ServerToClientEvents {
        guildCreate: (guildData: Guild) => void;
        ping: () => void;
    }
    type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    type SocketClient = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}
