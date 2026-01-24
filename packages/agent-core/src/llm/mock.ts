import { LLMProvider, ChatMessage, CompletionOptions } from './provider';

export class MockProvider implements LLMProvider {
    name = 'mock';

    async chat(messages: ChatMessage[], _options?: CompletionOptions): Promise<string> {
        const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
        return `[Mock AI Response] You said: "${lastUserMessage}". This is a simulated response from the Tobie Assistant.`;
    }

    async *chatStream(messages: ChatMessage[], options?: CompletionOptions): AsyncIterable<string> {
        const response = await this.chat(messages, options);
        const chunks = response.split(' ');

        for (const chunk of chunks) {
            yield chunk + ' ';
            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 50));
        }
    }
}
