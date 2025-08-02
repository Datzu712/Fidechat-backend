import type { Server, Socket } from 'socket.io';

declare interface x {
    status: string;
}

declare interface ServerToClientEvents {
    'instance:update': () => void;
    ping: () => void;
}

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
    type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    type SocketClient = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}
