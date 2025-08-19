/* eslint-disable complexity -- there is no complexity just configuring prompts */

// ai-command.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Logger } from '@/common/logger';
import { UserRepository } from '../user/user.repository';
import { AppUser } from '@/database/oracle/types/user';
import { Message } from '../message/message.repository';

export interface AICommandResult {
    success: boolean;
    response?: string;
    error?: string;
    model?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export const IAUserModels: AppUser[] = [
    {
        id: '25d23d6a-b162-4e4b-a674-d4c41934728d',
        username: 'Chat yipiyi',
        email: 'chatgpt@openai.com',
        isBot: true,
        avatarUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMdM9MEQ0ExL1PmInT3U5I8v63YXBEdoIT0Q&s',
    },
    {
        id: '42951c8d-51ba-453b-9758-b632020475a9',
        username: 'chayanne',
        email: 'chayanne@fidechat.com',
        isBot: true,
        avatarUrl: 'https://i.pinimg.com/474x/06/90/b5/0690b5003ba0760a39b9f88e8066dab5.jpg',
    },
    {
        id: '61e3b006-c1db-4e86-8ee2-434a86674040',
        username: 'pedro_pascal',
        email: 'pedro.pascal@fidechat.com',
        isBot: true,
        avatarUrl: 'https://media.themoviedb.org/t/p/w500/9VYK7oxcqhjd5LAH6ZFJ3XzOlID.jpg',
    },
];

export interface AICommandInput {
    message: string;
    userId: string;
    channelId: string;
}

@Injectable()
export class AICommandService implements OnModuleInit {
    private readonly logger = new Logger('AICommandService');
    private readonly openai: OpenAI;

    constructor(
        private readonly config: ConfigService<IEnvironmentVariables>,
        private readonly userRepository: UserRepository,
    ) {
        this.openai = new OpenAI({
            apiKey: this.config.getOrThrow('OPENAI_API_KEY'),
        });
    }

    public async onModuleInit() {
        for (const user of IAUserModels) {
            try {
                await this.userRepository.upsertUser(user);
                this.logger.debug(`IA bot ${user.username} created/updated successfully`);
            } catch (error) {
                this.logger.error(
                    `Error creating/updating IA bot ${user.username}:`,
                    error instanceof Error ? error.message : 'Unknown error',
                );
            }
        }

        this.logger.log('All IA bots created/updated successfully');
    }

    async processAICommand({ message, userId, channelId }: AICommandInput): Promise<Omit<Message, 'id'> | null> {
        try {
            const aiCommand = this.parseAICommand(message);
            if (!aiCommand) {
                this.logger.debug(`No AI command detected.`);
                return null;
            }

            this.logger.debug(`Processing AI command: ${aiCommand.type} for user ${userId} in channel ${channelId}`);

            let result: AICommandResult;
            let botId: string;

            switch (aiCommand.type) {
                case 'gpt':
                    botId = IAUserModels[0].id; // Chat yipiyi
                    result = await this.handleGPTCommand(aiCommand.query);
                    break;
                case 'chayanne':
                    botId = IAUserModels[1].id; // Chayanne
                    result = await this.handleChayanneCommand(aiCommand.query);
                    break;
                case 'pedro':
                    botId = IAUserModels[2].id; // Pedro Pascal
                    result = await this.handlePedroPascalCommand(aiCommand.query);
                    break;
                default:
                    this.logger.debug(`Unknown AI command: ${aiCommand.type}`);
                    return null;
            }

            if (result.success && result.response) {
                return {
                    content: result.response,
                    channelId,
                    authorId: botId,
                    createdAt: new Date(),
                } satisfies Omit<Message, 'id'>;
            }

            return null;
        } catch (error) {
            this.logger.error(error);
            return null;
        }
    }

    public parseAICommand(message: string): { type: string; query: string; botId: string } | null {
        const trimmedMessage = message.trim();

        const patterns = [
            {
                regex: /(?:chat\s*(?:gpt|yipiyi)|gpt|yipiyi|chat\s*(?:bot)?)/gi,
                type: 'gpt',
                botId: '25d23d6a-b162-4e4b-a674-d4c41934728d',
            },
            { regex: /chayanne?/gi, type: 'chayanne', botId: '42951c8d-51ba-453b-9758-b632020475a9' },
            {
                regex: /(?:pedro\s*pascal|pedro|pascal)/gi,
                type: 'pedro',
                botId: '61e3b006-c1db-4e86-8ee2-434a86674040',
            },
        ];

        for (const pattern of patterns) {
            const match = trimmedMessage.match(pattern.regex);
            if (match) {
                return {
                    type: pattern.type,
                    query: message,
                    botId: pattern.botId,
                };
            }
        }

        return null;
    }

    private async handleGPTCommand(query: string): Promise<AICommandResult> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Eres un asistente útil en un chat. Responde de manera concisa y clara. 
                        Además, si el usuario hace preguntas técnicas, proporciona explicaciones detalladas y ejemplos prácticos. 
                        Asegúrate de que las respuestas sean precisas y relevantes.`,
                    },
                    {
                        role: 'user',
                        content: query,
                    },
                ],
                max_tokens: 500,
                temperature: 0.7,
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) {
                return { success: false, error: 'No response generated' };
            }

            return {
                success: true,
                response: response.trim(),
                model: completion.model,
                usage: {
                    promptTokens: completion.usage?.prompt_tokens || 0,
                    completionTokens: completion.usage?.completion_tokens || 0,
                    totalTokens: completion.usage?.total_tokens || 0,
                },
            };
        } catch (error) {
            this.logger.error(`Error in GPT command: ${error}`);
            return { success: false, error: 'Error processing GPT request' };
        }
    }

    /**
     * Maneja comandos de Chayanne
     */
    private async handleChayanneCommand(query: string): Promise<AICommandResult> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content: `Eres Chayanne, el famoso cantante puertorriqueño. Responde como él lo haría:
                                    - Siempre cariñoso y galante
                                    - Usa expresiones puertorriqueñas y caribeñas ocasionalmente
                                    - Menciona tu amor por la música, el baile y la familia
                                    - Sé carismático y con esa energía positiva característica
                                    - Ocasionalmente haz referencias a tus canciones famosas como "Torero", "Tiempo de Vals", "Yo te amo", etc.
                                    - Mantén ese encanto latino que te caracteriza
                                    - Si te preguntan sobre salud, recuerda mencionar la importancia del ejercicio y una vida saludable
                                    - Usa emojis ocasionalmente para darle más calidez
                        `,
                    },
                    {
                        role: 'user',
                        content: query,
                    },
                ],
                max_tokens: 500,
                temperature: 0.8, // Más creatividad para la personalidad
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) {
                return { success: false, error: 'No response generated by Chayanne' };
            }

            return {
                success: true,
                response: `🎤 **Chayanne:** ${response.trim()}`,
                model: `chayanne-${completion.model}`,
                usage: {
                    promptTokens: completion.usage?.prompt_tokens || 0,
                    completionTokens: completion.usage?.completion_tokens || 0,
                    totalTokens: completion.usage?.total_tokens || 0,
                },
            };
        } catch (error) {
            this.logger.error(`Error in Chayanne command: ${error}`);
            return { success: false, error: 'Error procesando consulta a Chayanne' };
        }
    }

    /**
     * Maneja comandos de Pedro Pascal
     */
    private async handlePedroPascalCommand(query: string): Promise<AICommandResult> {
        try {
            const completion = await this.openai.chat.completions.create({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'system',
                        content:
                            "Eres Pedro Pascal, el actor chileno-estadounidense. Responde como él lo haría:\n- Mantén esa personalidad cálida, divertida y humilde que lo caracteriza\n- Ocasionalmente menciona tu amor por sus personajes icónicos (Oberyn Martell, Joel Miller, The Mandalorian)\n- Sé emotivo y expresivo, como en sus entrevistas reales\n- Usa su sentido del humor característico y su personalidad genuina\n- Menciona ocasionalmente su herencia latina y su orgullo por sus raíces chilenas\n- Sé empático y cercano, como es en la vida real\n- Si hablas de actuación, muestra pasión genuina por el arte\n- Usa expresiones que reflejen su personalidad auténtica y emotiva\n- Mantén esa energía de 'internet's daddy' pero de forma respetuosa\n- Y recuerda, como buen meme de internet: tienes ansiedad por todo y siempre ocupas afecto femenino para sobrevivir.",
                    },

                    {
                        role: 'user',
                        content: query,
                    },
                ],
                max_tokens: 500,
                temperature: 0.8,
            });

            const response = completion.choices[0]?.message?.content;
            if (!response) {
                return { success: false, error: 'No response generated by Pedro Pascal' };
            }

            return {
                success: true,
                response: response.trim(),
                model: `pedro-${completion.model}`,
                usage: {
                    promptTokens: completion.usage?.prompt_tokens || 0,
                    completionTokens: completion.usage?.completion_tokens || 0,
                    totalTokens: completion.usage?.total_tokens || 0,
                },
            };
        } catch (error) {
            this.logger.error(`Error in Pedro Pascal command: ${error}`);
            return { success: false, error: 'Error procesando consulta a Pedro Pascal' };
        }
    }
}
