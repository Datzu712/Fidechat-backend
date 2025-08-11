import { StrictOmit } from 'ts-essentials';
import type { Guild } from '../guild.repository';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class GuildDto implements StrictOmit<Guild, 'id' | 'ownerId'> {
    @IsString({ groups: ['create', 'update'] })
    @IsNotEmpty({ groups: ['create'] })
    name!: string;

    @IsOptional({ groups: ['create', 'update'] })
    @IsString({ groups: ['create', 'update'] })
    @IsUrl({}, { groups: ['create', 'update'] })
    iconUrl?: string;

    @IsBoolean({ groups: ['create', 'update'] })
    @IsOptional({ groups: ['create', 'update'] })
    isPublic!: boolean;

    // @IsString({ groups: ['create', 'update'] })
    // @IsNotEmpty({ groups: ['create'] })
    // @IsUUID('4', { groups: ['create', 'update'] })
    // ownerId!: string; Owner id is taken from the authenticated user
}
