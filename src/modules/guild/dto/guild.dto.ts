import { StrictOmit } from 'ts-essentials';
import type { Guild } from '../guild.repository';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class GuildDto implements StrictOmit<Guild, 'id'> {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsOptional()
    @IsString()
    @IsUrl()
    iconUrl?: string;

    @IsBoolean()
    @IsOptional()
    isPublic!: boolean;

    @IsString()
    @IsNotEmpty()
    ownerId!: string;
}
