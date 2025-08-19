import { IsOptional, IsString } from 'class-validator';

export class MessageDto {
    @IsString({ groups: ['create'] })
    @IsOptional({ groups: ['update'] })
    content!: string;
}
