import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Channel } from '../channel.repository';

export class ChannelDto implements Omit<Channel, 'id' | 'guildId'> {
    @IsString()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsOptional()
    position!: number;
}
