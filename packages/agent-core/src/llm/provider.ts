export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface CompletionOptions {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
}

export interface LLMProvider {
    name: string;
    chat(messages: ChatMessage[], options?: CompletionOptions): Promise<string>;
    chatStream(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<string>;
}
