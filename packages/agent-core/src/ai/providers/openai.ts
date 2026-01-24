/**
 * OpenAI Provider Implementation
 * 
 * Implements the AIProvider interface using the OpenAI API
 */

import OpenAI from 'openai';
import type {
    AIProvider,
    ProviderConfig,
    Message,
    ChatOptions,
    ChatResponse,
    StreamChunk,
    MessageRole,
} from '../types';
import {
    AIProviderError,
    AIRateLimitError,
    AIAuthenticationError,
} from '../types';

export class OpenAIProvider implements AIProvider {
    readonly name = 'openai';
    private client: OpenAI | null = null;
    private config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = config;
        if (this.isConfigured()) {
            this.client = new OpenAI({
                apiKey: config.apiKey,
                baseURL: config.baseURL,
                organization: config.organization,
                maxRetries: config.maxRetries ?? 2,
                timeout: config.timeout ?? 60000, // 60 seconds
            });
        }
    }

    isConfigured(): boolean {
        return !!this.config.apiKey && this.config.apiKey.length > 0;
    }

    private ensureClient(): OpenAI {
        if (!this.client) {
            throw new AIAuthenticationError(this.name);
        }
        return this.client;
    }

    private convertRole(role: MessageRole): 'system' | 'user' | 'assistant' {
        // OpenAI uses 'system', 'user', 'assistant'
        // Function role is handled separately
        if (role === 'function') return 'assistant';
        return role;
    }

    async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
        const client = this.ensureClient();

        try {
            const response = await client.chat.completions.create({
                model: options?.model ?? this.config.defaultModel ?? 'gpt-4-turbo-preview',
                messages: messages.map((msg) => ({
                    role: this.convertRole(msg.role),
                    content: msg.content,
                })),
                temperature: options?.temperature ?? 1,
                max_tokens: options?.maxTokens,
                user: options?.user,
                stream: false,
            });

            const choice = response.choices[0];
            if (!choice) {
                throw new AIProviderError('No response from OpenAI', this.name);
            }

            return {
                content: choice.message.content ?? '',
                role: 'assistant',
                model: response.model,
                usage: response.usage
                    ? {
                        promptTokens: response.usage.prompt_tokens,
                        completionTokens: response.usage.completion_tokens,
                        totalTokens: response.usage.total_tokens,
                    }
                    : undefined,
                finishReason: choice.finish_reason as any,
            };
        } catch (error: any) {
            if (error.status === 429) {
                const retryAfter = error.headers?.['retry-after'];
                throw new AIRateLimitError(this.name, retryAfter);
            }
            if (error.status === 401 || error.status === 403) {
                throw new AIAuthenticationError(this.name);
            }
            throw new AIProviderError(
                `OpenAI API error: ${error.message}`,
                this.name,
                error
            );
        }
    }

    async *streamChat(
        messages: Message[],
        options?: ChatOptions
    ): AsyncIterableIterator<StreamChunk> {
        const client = this.ensureClient();

        try {
            const stream = await client.chat.completions.create({
                model: options?.model ?? this.config.defaultModel ?? 'gpt-4-turbo-preview',
                messages: messages.map((msg) => ({
                    role: this.convertRole(msg.role),
                    content: msg.content,
                })),
                temperature: options?.temperature ?? 1,
                max_tokens: options?.maxTokens,
                user: options?.user,
                stream: true,
            });

            for await (const chunk of stream) {
                const delta = chunk.choices[0]?.delta;
                const content = delta?.content ?? '';

                yield {
                    content,
                    done: chunk.choices[0]?.finish_reason !== null,
                };
            }
        } catch (error: any) {
            if (error.status === 429) {
                const retryAfter = error.headers?.['retry-after'];
                throw new AIRateLimitError(this.name, retryAfter);
            }
            if (error.status === 401 || error.status === 403) {
                throw new AIAuthenticationError(this.name);
            }
            throw new AIProviderError(
                `OpenAI API streaming error: ${error.message}`,
                this.name,
                error
            );
        }
    }
}

/**
 * Factory function to create an OpenAI provider
 */
export function createOpenAIProvider(config: ProviderConfig): OpenAIProvider {
    return new OpenAIProvider(config);
}
