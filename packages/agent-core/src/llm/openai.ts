import { LLMProvider, ChatMessage, CompletionOptions } from './provider';
import OpenAI from 'openai';

export class OpenAIProvider implements LLMProvider {
    name = 'openai';
    private client: OpenAI;

    constructor(apiKey: string) {
        this.client = new OpenAI({ apiKey });
    }

    async chat(messages: ChatMessage[], options?: CompletionOptions): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: options?.model || 'gpt-4',
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: options?.temperature || 0.7,
            max_tokens: options?.maxTokens,
        });

        return response.choices[0]?.message?.content || '';
    }

    async *chatStream(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<string> {
        const stream = await this.client.chat.completions.create({
            model: options?.model || 'gpt-4',
            messages: messages.map(m => ({ role: m.role, content: m.content })),
            temperature: options?.temperature || 0.7,
            max_tokens: options?.maxTokens,
            stream: true,
        });

        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
                yield content;
            }
        }
    }
}
