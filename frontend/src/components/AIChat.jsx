import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Trash2, ChevronDown, Bot, User } from 'lucide-react';
import { chatApi } from '../api';

export default function AIChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            loadHistory();
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const loadHistory = async () => {
        try {
            const history = await chatApi.getHistory();
            setMessages(history);
        } catch (err) {
            console.error('Failed to load chat history:', err);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = { role: 'user', content: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await chatApi.send(input);
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please make sure the backend server is running.',
                error: true
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await chatApi.clearHistory();
            setMessages([]);
        } catch (err) {
            console.error('Failed to clear history:', err);
        }
    };

    const suggestions = [
        "Show all my applications",
        "What deadlines are coming up?",
        "Add TU Munich Computer Science",
        "Give me a summary",
    ];

    return (
        <>
            {/* Chat bubble button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`
          fixed bottom-6 right-6 z-40 p-4 rounded-2xl shadow-2xl transition-all duration-300
          bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700
          hover:scale-105 active:scale-95
          ${isOpen ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100'}
        `}
                style={{ boxShadow: '0 8px 40px -8px rgba(99, 102, 241, 0.6)' }}
            >
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2} />
            </button>

            {/* Chat panel */}
            <div className={`
        fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-3rem)] 
        transition-all duration-500 ease-out
        ${isOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-8 pointer-events-none'
                }
      `}>
                <div className="bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-200 dark:border-surface-800 overflow-hidden flex flex-col"
                    style={{
                        height: 'min(600px, calc(100vh - 6rem))',
                        boxShadow: '0 24px 80px -16px rgba(0,0,0,0.25), 0 0 0 1px rgba(99,102,241,0.1)'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-surface-200 dark:border-surface-800 bg-gradient-to-r from-primary-500 to-primary-600">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">AI Assistant</h3>
                                <p className="text-xs text-white/70">Powered by GPT-4</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearChat}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                                title="Clear chat"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 dark:bg-primary-950/30 flex items-center justify-center">
                                    <Bot className="w-8 h-8 text-primary-500" />
                                </div>
                                <h4 className="font-semibold text-surface-900 dark:text-white mb-1">
                                    How can I help?
                                </h4>
                                <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">
                                    Ask me about your applications
                                </p>

                                <div className="space-y-2">
                                    {suggestions.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setInput(s)}
                                            className="block w-full text-left px-4 py-2.5 text-sm rounded-xl bg-surface-50 dark:bg-surface-800 hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300 transition-colors"
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`
                  flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                  ${msg.role === 'user'
                                        ? 'bg-primary-100 dark:bg-primary-900/40'
                                        : 'bg-surface-100 dark:bg-surface-800'
                                    }
                `}>
                                    {msg.role === 'user'
                                        ? <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                        : <Bot className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                                    }
                                </div>
                                <div className={`
                  max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${msg.role === 'user'
                                        ? 'bg-primary-500 text-white rounded-br-md'
                                        : msg.error
                                            ? 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 rounded-bl-md'
                                            : 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:text-surface-200 rounded-bl-md'
                                    }
                `}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                    <Bot className="w-4 h-4 text-surface-500 dark:text-surface-400" />
                                </div>
                                <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-surface-100 dark:bg-surface-800">
                                    <div className="flex gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 rounded-full bg-surface-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={sendMessage} className="p-4 border-t border-surface-200 dark:border-surface-800 bg-surface-50 dark:bg-surface-900/50">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your applications..."
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 disabled:opacity-50"
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="p-3 bg-primary-500 hover:bg-primary-600 disabled:bg-surface-300 dark:disabled:bg-surface-700 text-white rounded-xl transition-colors disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
