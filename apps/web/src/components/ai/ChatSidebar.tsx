/**
 * ChatSidebar Component
 * 
 * Collapsible sidebar for interacting with the Tobie AI Assistant
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';

// ============================================================================
// TYPES
// ============================================================================

interface Message {
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface ChatSidebarProps {
    projectId?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ChatSidebar({ projectId }: ChatSidebarProps) {
    const { data: session } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Handle sending a message
    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.content,
                    projectId,
                    stream: false,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to get response');
            }

            const data = await response.json();

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            console.error('Chat error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle Enter key
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!session) {
        return null; // Don't show chat if not logged in
    }

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 z-50 bg-[#3D85C6] text-white p-4 rounded-full shadow-lg hover:bg-[#2E6BA8] transition-all duration-200 flex items-center gap-2"
                    aria-label="Open AI Assistant"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                    </svg>
                    <span className="hidden md:inline font-medium">AI Assistant</span>
                </button>
            )}

            {/* Sidebar */}
            {isOpen && (
                <div className="fixed inset-y-0 right-0 z-50 w-full md:w-96 bg-[#1A1A1C] border-l border-gray-800 shadow-2xl flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-pulse"></div>
                            <h2 className="text-white font-semibold">Tobie Assistant</h2>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                            aria-label="Close"
                        >
                            <svg
                                className="w-6 h-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-gray-500 mt-8">
                                <svg
                                    className="w-16 h-16 mx-auto mb-4 text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                    />
                                </svg>
                                <p className="text-sm">
                                    Hi! I'm Tobie, your AI project assistant.
                                    <br />
                                    Ask me about tasks, projects, or timelines.
                                </p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg p-3 ${msg.role === 'user'
                                        ? 'bg-[#3D85C6] text-white'
                                        : 'bg-[#2A2A2C] text-gray-100'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                    <p className="text-xs opacity-60 mt-1">
                                        {msg.timestamp.toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-[#2A2A2C] rounded-lg p-3">
                                    <div className="flex gap-2">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                        <div
                                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.2s' }}
                                        ></div>
                                        <div
                                            className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                                            style={{ animationDelay: '0.4s' }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-[#E5593D]/10 border border-[#E5593D] rounded-lg p-3">
                                <p className="text-[#E5593D] text-sm">{error}</p>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-800">
                        <div className="flex gap-2">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Tobie anything..."
                                className="flex-1 bg-[#2A2A2C] text-white placeholder-gray-500 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#3D85C6] min-h-[44px] max-h-32"
                                rows={1}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="bg-[#3D85C6] text-white px-4 py-2 rounded-lg hover:bg-[#2E6BA8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                                aria-label="Send"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                    />
                                </svg>
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Press Enter to send • Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
