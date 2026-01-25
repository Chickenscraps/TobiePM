import { NextRequest, NextResponse } from 'next/server';
import {
    AgentOrchestrator,
    MockProvider,
    OpenAIProvider,
    GeminiProvider,
    createTaskSkill,
    listTasksSkill
} from '@tobie/agent-core';
import { prisma } from '@/lib/prisma';
import { InMemoryAuditLogger } from '@tobie/audit';

export const dynamic = 'force-dynamic';

// Simple audit logger factory 
const auditLogger = new InMemoryAuditLogger();

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();

        // 1. Select Provider
        const openAIKey = process.env.OPENAI_API_KEY;
        const googleKey = process.env.GOOGLE_AI_API_KEY;
        const geminiModel = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

        let provider;
        if (openAIKey) {
            provider = new OpenAIProvider(openAIKey);
        } else if (googleKey) {
            provider = new GeminiProvider(googleKey, geminiModel);
        } else {
            provider = new MockProvider();
        }

        // 2. Initialize Agent
        const agent = new AgentOrchestrator(provider);

        // 3. Register Skills with DB Context
        // In a real route/prod, get userId from session. Mocking for now.
        const userId = 'system-ai';

        agent.registerTool(createTaskSkill({ db: prisma, audit: auditLogger, userId }));
        agent.registerTool(listTasksSkill({ db: prisma }));

        // 4. Create Stream
        const stream = await agent.streamChat(message, history || []);

        // 5. Return ReadableStream
        const readable = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of stream) {
                        controller.enqueue(new TextEncoder().encode(chunk));
                    }
                    controller.close();
                } catch (e) {
                    controller.error(e);
                }
            }
        });

        return new NextResponse(readable, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        return NextResponse.json(
            { error: 'Failed to process chat request' },
            { status: 500 }
        );
    }
}
