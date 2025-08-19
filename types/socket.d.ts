import type { AppUser, GuildUser } from '@/database/oracle/types/user';
import type { Channel } from '@/modules/channel/channel.repository';
import type { Guild } from '@/modules/guild/guild.repository';
import type { Message } from '@/modules/message/message.repository';
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
        channelCreate: (channelData: Channel) => void;
        ping: () => void;
        welcome: (message: string) => void;
        messageCreate: (data: Message) => void;
        memberAdd: (data: { user: AppUser; memberMetadata: GuildUser }) => void;
        forceSync: () => void;
        // messageUpdate: (message: { id: string; content: string }) => void;
        // messageDelete: (message: { id: string }) => void;
    }
    type SocketServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
    type SocketClient = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
}
