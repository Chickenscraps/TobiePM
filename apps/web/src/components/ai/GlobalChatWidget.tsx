'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function GlobalChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg: ChatMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.content,
                    history: messages.map(m => ({ role: m.role, content: m.content }))
                }),
            });

            if (!response.ok) throw new Error('Failed to fetch response');
            if (!response.body) throw new Error('No response body');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const text = decoder.decode(value, { stream: true });
                setMessages(prev => {
                    const newHistory = [...prev];
                    const lastMsg = newHistory[newHistory.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                        lastMsg.content += text;
                    }
                    return newHistory;
                });
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 p-4 bg-primary-600 hover:bg-primary-500 rounded-full shadow-2xl transition-transform hover:scale-110 z-50 group"
                title="Open Tobie Assistant"
                aria-label="Open AI Assistant"
            >
                <Sparkles className="w-6 h-6 text-white" />
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Ask Tobie
                </span>
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl flex flex-col z-50 transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-96 h-[32rem]'}`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 border-b border-neutral-800 cursor-pointer"
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="font-semibold text-white text-sm">Tobie Assistant</span>
                </div>
                <div className="flex items-center gap-1 text-neutral-400">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="p-1 hover:bg-white/5 rounded"
                    >
                        {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                        className="p-1 hover:bg-white/5 rounded"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            {!isMinimized && (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center text-neutral-500 text-sm mt-8">
                                <p>Hi! I'm Tobie.</p>
                                <p className="text-xs mt-1">I can help you manage tasks, check scope, or answers questions about your project.</p>
                            </div>
                        )}
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${msg.role === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none'
                                    : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5'
                                    }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex justify-start">
                                <div className="bg-neutral-800 rounded-lg p-3 rounded-tl-none border border-white/5 flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSubmit} className="p-3 border-t border-neutral-800 bg-neutral-900 rounded-b-xl">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-md hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}
