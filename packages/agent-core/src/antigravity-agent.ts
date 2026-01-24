/**
 * AntiGravity AI Agent
 * 
 * Main agent class that orchestrates AI interactions, manages context,
 * and handles transcripts for the Tobie Command Center.
 */

import type { AIProvider, Message, ChatOptions } from './ai/types';
import { getSystemPrompt } from './prompts/system';

// ============================================================================
// TYPES
// ============================================================================

export interface AgentContext {
    userId: string;
    userName?: string;
    userRole?: string;
    projectId?: string;
    projectScope?: string;
}

export interface ChatInput {
    message: string;
    context: AgentContext;
    conversationHistory?: Message[];
}

export interface ChatOutput {
    response: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

// ============================================================================
// AGENT CLASS
// ============================================================================

export class AntiGravityAgent {
    private provider: AIProvider;
    private defaultModel?: string;
    private maxConversationLength: number;

    constructor(
        provider: AIProvider,
        options?: {
            defaultModel?: string;
            maxConversationLength?: number;
        }
    ) {
        this.provider = provider;
        this.defaultModel = options?.defaultModel;
        this.maxConversationLength = options?.maxConversationLength ?? 10; // Keep last 10 messages
    }

    /**
     * Check if the agent is ready to use
     */
    isReady(): boolean {
        return this.provider.isConfigured();
    }

    /**
     * Build messages array with system prompt and conversation history
     */
    private buildMessages(input: ChatInput): Message[] {
        const messages: Message[] = [];

        // System prompt
        messages.push({
            role: 'system',
            content: getSystemPrompt({
                projectScope: input.context.projectScope,
                userRole: input.context.userRole,
            }),
            timestamp: new Date(),
        });

        // Conversation history (keep recent messages to stay within token limits)
        if (input.conversationHistory && input.conversationHistory.length > 0) {
            const recentHistory = input.conversationHistory.slice(
                -this.maxConversationLength
            );
            messages.push(...recentHistory);
        }

        // Current user message
        messages.push({
            role: 'user',
            content: input.message,
            timestamp: new Date(),
        });

        return messages;
    }

    /**
     * Send a chat message and get a response
     */
    async chat(input: ChatInput, options?: ChatOptions): Promise<ChatOutput> {
        if (!this.isReady()) {
            throw new Error('AntiGravity agent is not configured');
        }

        const messages = this.buildMessages(input);

        const response = await this.provider.chat(messages, {
            ...options,
            model: options?.model ?? this.defaultModel,
            user: input.context.userId,
        });

        return {
            response: response.content,
            usage: response.usage,
        };
    }

    /**
     * Stream a chat response
     */
    async *streamChat(
        input: ChatInput,
        options?: ChatOptions
    ): AsyncIterableIterator<string> {
        if (!this.isReady()) {
            throw new Error('AntiGravity agent is not configured');
        }

        const messages = this.buildMessages(input);

        const stream = this.provider.streamChat(messages, {
            ...options,
            model: options?.model ?? this.defaultModel,
            user: input.context.userId,
        });

        for await (const chunk of stream) {
            yield chunk.content;
        }
    }

    /**
     * Format a conversation history for storage
     */
    static formatTranscript(messages: Message[]): string {
        return JSON.stringify(
            messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp?.toISOString() ?? new Date().toISOString(),
            }))
        );
    }

    /**
     * Parse a stored transcript back into messages
     */
    static parseTranscript(transcript: string): Message[] {
        try {
            const parsed = JSON.parse(transcript);
            return parsed.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
            }));
        } catch (error) {
            throw new Error(`Failed to parse transcript: ${error}`);
        }
    }
}

/**
 * Factory function to create an AntiGravity agent with an AI provider
 * Defaults to Gemini (free tier available)
 */
export function createAntiGravityAgent(
    apiKey: string,
    options?: {
        provider?: 'openai' | 'gemini';
        model?: string;
        maxConversationLength?: number;
    }
): AntiGravityAgent {
    const providerType = options?.provider || 'gemini';

    let provider;
    if (providerType === 'openai') {
        const { createOpenAIProvider } = require('./ai/providers/openai');
        provider = createOpenAIProvider({
            apiKey,
            defaultModel: options?.model ?? 'gpt-4-turbo-preview',
        });
    } else {
        // Default to Gemini
        const { createGeminiProvider } = require('./ai/providers/gemini');
        provider = createGeminiProvider({
            apiKey,
            defaultModel: options?.model ?? 'gemini-2.0-flash-exp',
        });
    }

    return new AntiGravityAgent(provider, {
        defaultModel: options?.model,
        maxConversationLength: options?.maxConversationLength,
    });
}
