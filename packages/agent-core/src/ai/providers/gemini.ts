/**
 * Google Gemini Provider Implementation
 * 
 * Implements the AIProvider interface using Google's Generative AI SDK
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    AIProvider,
    ProviderConfig,
    Message,
    ChatOptions,
    ChatResponse,
} from '../types';
import {
    AIProviderError,
    AIRateLimitError,
    AIAuthenticationError,
} from '../types';

export class GeminiProvider implements AIProvider {
    readonly name = 'gemini';
    private client: GoogleGenerativeAI | null = null;
    private config: ProviderConfig;

    constructor(config: ProviderConfig) {
        this.config = config;
        if (this.isConfigured()) {
            this.client = new GoogleGenerativeAI(config.apiKey);
        }
    }

    isConfigured(): boolean {
        return !!this.config.apiKey && this.config.apiKey.length > 0;
    }

    private ensureClient(): GoogleGenerativeAI {
        if (!this.client) {
            throw new AIAuthenticationError(this.name);
        }
        return this.client;
    }

    /**
     * Convert our message format to Gemini's format
     */
    private convertMessages(messages: Message[]) {
        // Gemini uses a different format: { role: 'user' | 'model', parts: [{ text }] }
        // System messages need to be handled via systemInstruction

        const systemMessage = messages.find((m) => m.role === 'system');
        const chatMessages = messages.filter((m) => m.role !== 'system');

        const geminiMessages = chatMessages.map((msg) => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }],
        }));

        return {
            systemInstruction: systemMessage?.content,
            history: geminiMessages.slice(0, -1), // All but the last message
            currentMessage: geminiMessages[geminiMessages.length - 1]?.parts[0]?.text || '',
        };
    }

    async chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse> {
        const client = this.ensureClient();

        try {
            const model = client.getGenerativeModel({
                model: options?.model ?? this.config.defaultModel ?? 'gemini-2.0-flash-exp',
                systemInstruction: this.convertMessages(messages).systemInstruction,
            });

            const { history, currentMessage } = this.convertMessages(messages);

            // Start chat with history
            const chat = model.startChat({
                history: history as any,
            });

            // Send current message
            const result = await chat.sendMessage(currentMessage);
            const response = result.response;
            const text = response.text();

            return {
                content: text,
                role: 'assistant',
                model: options?.model ?? this.config.defaultModel ?? 'gemini-2.0-flash-exp',
                usage: response.usageMetadata
                    ? {
                        promptTokens: response.usageMetadata.promptTokenCount || 0,
                        completionTokens: response.usageMetadata.candidatesTokenCount || 0,
                        totalTokens: response.usageMetadata.totalTokenCount || 0,
                    }
                    : undefined,
                finishReason: 'stop',
            };
        } catch (error: any) {
            // Check for common Gemini errors
            const errorMessage = error.message?.toLowerCase() || '';
            const errorString = JSON.stringify(error).toLowerCase();

            if (errorMessage.includes('quota') || errorMessage.includes('rate limit') ||
                errorMessage.includes('resource_exhausted')) {
                throw new AIRateLimitError(this.name);
            }
            if (errorMessage.includes('api key') || errorMessage.includes('auth') ||
                errorMessage.includes('permission') || errorMessage.includes('not enabled') ||
                errorString.includes('api_key_invalid') || errorString.includes('permission_denied')) {
                throw new AIProviderError(
                    'Gemini API authentication failed. The API key may be invalid or the Generative Language API is not enabled. ' +
                    'Enable it at: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com',
                    this.name,
                    error
                );
            }
            throw new AIProviderError(
                `Gemini API error: ${error.message}`,
                this.name,
                error
            );
        }
    }

    async *streamChat(
        messages: Message[],
        options?: ChatOptions
    ): AsyncIterableIterator<{ content: string; done: boolean }> {
        const client = this.ensureClient();

        try {
            const model = client.getGenerativeModel({
                model: options?.model ?? this.config.defaultModel ?? 'gemini-2.0-flash-exp',
                systemInstruction: this.convertMessages(messages).systemInstruction,
            });

            const { history, currentMessage } = this.convertMessages(messages);

            // Start chat with history
            const chat = model.startChat({
                history: history as any,
            });

            // Stream response
            const result = await chat.sendMessageStream(currentMessage);

            for await (const chunk of result.stream) {
                const text = chunk.text();
                yield {
                    content: text,
                    done: false,
                };
            }

            // Final chunk to indicate completion
            yield {
                content: '',
                done: true,
            };
        } catch (error: any) {
            if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
                throw new AIRateLimitError(this.name);
            }
            if (error.message?.includes('API key') || error.message?.includes('authentication')) {
                throw new AIAuthenticationError(this.name);
            }
            throw new AIProviderError(
                `Gemini API streaming error: ${error.message}`,
                this.name,
                error
            );
        }
    }
}

/**
 * Factory function to create a Gemini provider
 */
export function createGeminiProvider(config: ProviderConfig): GeminiProvider {
    return new GeminiProvider(config);
}
