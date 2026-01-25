import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function GlobalChatWidget() {
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

    // Onboarding greeting
    useEffect(() => {
        const hasGreeted = sessionStorage.getItem('tobie_greeted');
        if (!hasGreeted) {
            setMessages([{
                role: 'assistant',
                content: "Hi Josh! 👋 Welcome back to your Command Center. Today is Jan 24th, 6:56 PM PT. Ann (Vietnam) is currently Away/Sleeping. \n\nYou have 85 tasks due on March 1st. I recommend starting with the 'Empire Life Q1 Video' review—it's high priority. How can I help you today?"
            }]);
            sessionStorage.setItem('tobie_greeted', 'true');
        }
    }, []);

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

    return (
        <div className="flex flex-col h-full bg-neutral-900/50 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-500 to-amber-500 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <span className="font-semibold text-white text-sm block leading-none">Tobie Assistant</span>
                        <span className="text-[10px] text-primary-400 font-medium">Online</span>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.length === 0 && !isLoading && (
                    <div className="text-center text-neutral-500 text-sm mt-8 opacity-50">
                        <Sparkles className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                        <p>Ask me anything about your projects or tasks.</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] rounded-xl p-3 text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-primary-600 text-white shadow-lg'
                            : 'bg-white/5 text-neutral-200 border border-white/10 shadow-inner'
                            }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && messages[messages.length - 1]?.role === 'user' && (
                    <div className="flex justify-start">
                        <div className="bg-white/5 rounded-xl p-3 border border-white/10 flex gap-1 items-center">
                            <span className="w-1.5 h-1.5 bg-primary-500/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary-500/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-primary-500/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Overlay */}
            <div className="p-4 border-t border-white/5 bg-neutral-900/80">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Tobie..."
                        className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all placeholder:text-neutral-600"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        title="Send Message"
                        aria-label="Send Message"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg active:scale-95"
                    >
                        <Send size={14} />
                    </button>
                </form>
                <p className="text-[10px] text-center text-neutral-600 mt-2">
                    Press Enter to send
                </p>
            </div>
        </div>
    );
}
