/**
 * AI Provider Types and Interfaces
 * 
 * Defines the abstraction layer for AI providers (OpenAI, Anthropic, Gemini, etc.)
 * allowing for easy swapping and multi-model orchestration.
 */

import type { z } from 'zod';

// ============================================================================
// MESSAGE TYPES
// ============================================================================

export type MessageRole = 'system' | 'user' | 'assistant' | 'function';

export interface Message {
    role: MessageRole;
    content: string;
    name?: string; // For function messages
    timestamp?: Date;
}

// ============================================================================
// CHAT OPTIONS
// ============================================================================

export interface ChatOptions {
    model?: string;
    temperature?: number; // 0-2, default 1
    maxTokens?: number;
    stream?: boolean;
    functions?: FunctionDefinition[]; // For function calling
    user?: string; // User ID for tracking
}

// ============================================================================
// FUNCTION CALLING
// ============================================================================

export interface FunctionDefinition {
    name: string;
    description: string;
    parameters: z.ZodObject<any>; // Zod schema for validation
}

export interface FunctionCall {
    name: string;
    arguments: string; // JSON string
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ChatResponse {
    content: string;
    role: MessageRole;
    functionCall?: FunctionCall;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    finishReason?: 'stop' | 'length' | 'function_call' | 'content_filter';
}

export interface StreamChunk {
    content: string;
    done: boolean;
}

// ============================================================================
// PROVIDER INTERFACE
// ============================================================================

export interface AIProvider {
    /**
     * Provider name (e.g., 'openai', 'anthropic', 'gemini')
     */
    readonly name: string;

    /**
     * Send a chat completion request
     */
    chat(messages: Message[], options?: ChatOptions): Promise<ChatResponse>;

    /**
     * Send a streaming chat completion request
     * Returns an async iterator that yields chunks of the response
     */
    streamChat(
        messages: Message[],
        options?: ChatOptions
    ): AsyncIterableIterator<StreamChunk>;

    /**
     * Check if the provider is configured and ready
     */
    isConfigured(): boolean;
}

// ============================================================================
// PROVIDER CONFIGURATION
// ============================================================================

export interface ProviderConfig {
    apiKey: string;
    baseURL?: string;
    organization?: string;
    defaultModel?: string;
    maxRetries?: number;
    timeout?: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AIProviderError extends Error {
    constructor(
        message: string,
        public readonly provider: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'AIProviderError';
    }
}

export class AIRateLimitError extends AIProviderError {
    constructor(provider: string, public readonly retryAfter?: number) {
        super(`Rate limit exceeded for ${provider}`, provider);
        this.name = 'AIRateLimitError';
    }
}

export class AIAuthenticationError extends AIProviderError {
    constructor(provider: string) {
        super(`Authentication failed for ${provider}`, provider);
        this.name = 'AIAuthenticationError';
    }
}
