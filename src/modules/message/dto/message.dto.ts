import { IsOptional, IsString } from 'class-validator';

export class CreateMessageDto {
    @IsString({ groups: ['create'] })
    @IsOptional({ groups: ['update'] })
    content!: string;
}
