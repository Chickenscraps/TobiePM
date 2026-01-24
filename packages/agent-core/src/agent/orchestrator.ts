import { LLMProvider, ChatMessage } from '../llm/provider';
import { SYSTEM_PROMPTS } from './prompts';

export interface Tool {
    name: string;
    description: string;
    execute: (args: any) => Promise<any>;
    parameters: any; // JSON schema for args
}

export class AgentOrchestrator {
    private provider: LLMProvider;
    private tools: Tool[] = [];
    private systemPrompt: string;

    constructor(provider: LLMProvider, systemPrompt: string = SYSTEM_PROMPTS.DEFAULT) {
        this.provider = provider;
        this.systemPrompt = systemPrompt;
    }

    registerTool(tool: Tool) {
        this.tools.push(tool);
    }

    async chat(userMessage: string, history: ChatMessage[] = []): Promise<string> {
        // Simple orchestration: 
        // 1. Check if we strictly need a tool (simple keyword matching or LLM decision in future)
        // 2. For MVP, we'll just send text to LLM, but we can enhance this to use function calling

        // Prepare context
        const messages: ChatMessage[] = [
            { role: 'system', content: this.systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
        ];

        // MVP: Using Mock/OpenAI directly without tool calling loop yet
        // In full implementation, we would check for function calls in response
        return this.provider.chat(messages);
    }

    async streamChat(userMessage: string, history: ChatMessage[] = []): Promise<AsyncIterable<string>> {
        const messages: ChatMessage[] = [
            { role: 'system', content: this.systemPrompt },
            ...history,
            { role: 'user', content: userMessage }
        ];

        return this.provider.chatStream(messages);
    }
}
