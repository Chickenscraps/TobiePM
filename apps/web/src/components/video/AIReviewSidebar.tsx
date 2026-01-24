'use client';

import { useState } from 'react';
import { Send, BrainCircuit } from 'lucide-react';

interface AIReviewSidebarProps {
    currentTime: number;
    onSeek: (time: number) => void;
}

export function AIReviewSidebar({ currentTime, onSeek }: AIReviewSidebarProps) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; content: string; timestamp?: number }[]>([
        { role: 'ai', content: "Hi! I'm your AI review assistant. I can help check if feedback is out-of-scope or suggest improvements. What do you think of this frame?" }
    ]);
    const [input, setInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage = { role: 'user' as const, content: input, timestamp: currentTime };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsAnalyzing(true);

        // Simulate AI response
        setTimeout(() => {
            setIsAnalyzing(false);
            let responseContent = "That's a valid point. I've noted it for the editor.";

            // Simple keyword simulation
            if (input.toLowerCase().includes('scope') || input.toLowerCase().includes('change everything')) {
                responseContent = "⚠️ Warning: This request might be out of scope based on the initial brief. The contract specifies only minor color corrections at this stage.";
            } else if (input.toLowerCase().includes('color') || input.toLowerCase().includes('darker')) {
                responseContent = "I can flag this color change. Is it for the background or the foreground elements?";
            }

            setMessages(prev => [...prev, { role: 'ai', content: responseContent }]);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full bg-neutral-900 border-l border-white/10 w-80">
            <div className="p-4 border-b border-white/10 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-primary-400" />
                <h2 className="font-semibold text-sm text-white">AI Assistant</h2>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div
                            className={`max-w-[90%] p-3 rounded-lg text-sm ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none'
                                : 'bg-neutral-800 text-neutral-200 rounded-tl-none border border-white/5'
                                }`}
                        >
                            {msg.content}
                        </div>
                        {msg.timestamp !== undefined && (
                            <button
                                onClick={() => onSeek(msg.timestamp!)}
                                className="text-[10px] text-neutral-500 mt-1 hover:text-primary-400"
                            >
                                @ {Math.floor(msg.timestamp / 60)}:{Math.floor(msg.timestamp % 60).toString().padStart(2, '0')}
                            </button>
                        )}
                    </div>
                ))}
                {isAnalyzing && (
                    <div className="flex items-center gap-2 text-neutral-500 text-xs animate-pulse">
                        <BrainCircuit className="w-3 h-3" />
                        Analyzing request...
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask AI or check scope..."
                        className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isAnalyzing}
                        className="p-2 bg-primary-600 rounded-md text-white hover:bg-primary-500 disabled:opacity-50"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
