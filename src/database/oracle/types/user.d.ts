export interface AppUser {
    id: string;
    username: string;
    email: string;
    isBot: boolean;
    avatarUrl?: string;
}

export interface GuildUser {
    guildId: string;
    userId: string;
}
