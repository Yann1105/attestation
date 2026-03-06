import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Bot, User as UserIcon, Copy, Check } from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    template?: any;
    isGenerating?: boolean;
}

interface CanvasChatViewProps {
    messages: Message[];
    onSendMessage: (content: string, format: 'json' | 'html') => void;
    isGenerating: boolean;
}

const CanvasChatView: React.FC<CanvasChatViewProps> = ({
    messages,
    onSendMessage,
    isGenerating
}) => {
    const [inputValue, setInputValue] = useState('');
    const [useHtml, setUseHtml] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isGenerating]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim() && !isGenerating) {
            onSendMessage(inputValue, useHtml ? 'html' : 'json');
            setInputValue('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as any);
        }
    };

    const handleCopy = (content: string, id: string) => {
        navigator.clipboard.writeText(content);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
        setInputValue(content);
    };

    return (
        <div className="flex flex-col h-full w-full bg-white relative">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in-up">
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-200">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <div className="max-w-md space-y-2">
                                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
                                    Que voulez-vous créer ?
                                </h2>
                                <p className="text-lg text-gray-500">
                                    Décrivez votre certificat ou attestation idéale, et je générerai le code pour vous.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                                {['Certificat de réussite formation Python', 'Attestation de présence stage data', 'Diplôme honorifique design moderne', 'Affiche événement tech A4'].map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setInputValue(suggestion)}
                                        className="p-4 text-left text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-xl transition-all duration-200"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((message) => (
                                <div key={message.id} className="flex gap-4 md:gap-6 group">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 ${message.role === 'assistant'
                                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {message.role === 'assistant' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                    </div>

                                    <div className="flex-1 space-y-2 max-w-2xl relative">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {message.role === 'assistant' ? 'Silma AI' : 'Vous'}
                                            </div>
                                            {message.role === 'user' && (
                                                <button
                                                    onClick={() => handleCopy(message.content, message.id)}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
                                                    title="Copier et modifier"
                                                >
                                                    {copiedId === message.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                            )}
                                        </div>
                                        <div className={`prose prose-sm max-w-none text-gray-800 leading-relaxed ${message.role === 'user' ? 'whitespace-pre-wrap' : ''}`}>
                                            {message.content}
                                        </div>
                                        {message.isGenerating && (
                                            <div className="flex items-center gap-2 text-blue-600">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-xs font-medium">Génération en cours...</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>
            </div>

            {/* Input Area - Fixed at bottom */}
            <div className="w-full bg-gradient-to-t from-white via-white to-transparent pb-6 pt-10 px-4 z-10">
                <div className="max-w-3xl mx-auto relative">
                    <div className="relative flex items-end gap-2 bg-white border border-gray-200 shadow-xl shadow-gray-200/50 rounded-2xl p-2 transition-shadow hover:shadow-2xl hover:shadow-gray-200/50 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
                        <textarea
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Décrivez le certificat à générer..."
                            className="w-full max-h-48 min-h-[56px] py-4 px-4 bg-transparent border-none focus:ring-0 text-base text-gray-800 placeholder-gray-400 resize-none custom-scrollbar"
                            rows={1}
                            style={{ height: 'auto', minHeight: '56px' }}
                        />
                        <div className="flex flex-col gap-2 pb-2 pr-2">
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={!inputValue.trim() || isGenerating}
                                className={`p-2 rounded-xl transition-all duration-200 ${inputValue.trim() && !isGenerating
                                    ? 'bg-black text-white hover:bg-gray-800'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isGenerating ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="text-center mt-2">
                        <p className="text-xs text-gray-400">
                            Silma AI peut faire des erreurs. Vérifiez les informations importantes.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CanvasChatView;
