
import React, { useRef, useEffect } from 'react';
import type { ChatSession, Message } from '../types';
import MessageBubble from './Message';
import ChatInput from './ChatInput';
import { LogoIcon } from './icons';

interface ChatPanelProps {
    chat: ChatSession | null | undefined;
    isLoading: boolean;
    onSendMessage: (message: Message, systemMessage?: string) => void;
}

const WelcomeScreen: React.FC = () => (
    <div className="flex-1 flex flex-col justify-center items-center text-center p-4 md:p-8 overflow-y-auto">
        {/* Animated Hero Section */}
        <div className="mb-6 md:mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-accent/20 to-brand-gold/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-br from-brand-accent/10 via-brand-accent/5 to-brand-gold/10 dark:from-brand-accent/20 dark:via-brand-accent/10 dark:to-brand-gold/20 p-8 md:p-10 rounded-3xl shadow-premium-lg border border-brand-accent/20 dark:border-brand-accent/30">
                <div className="bg-gradient-to-br from-white via-brand-light to-white dark:from-brand-dark dark:via-brand-dark-secondary dark:to-brand-dark p-6 rounded-2xl shadow-inner">
                    <LogoIcon size={64} className="text-brand-accent dark:text-white animate-pulse" />
                </div>
            </div>
        </div>
        
        {/* Title & Description */}
        <div className="mb-8 md:mb-10 space-y-3">
            <h1 className="text-3xl md:text-5xl font-extrabold bg-gradient-to-r from-brand-accent via-blue-600 to-brand-gold bg-clip-text text-transparent animate-gradient">
                Welcome to Lawlens
            </h1>
            <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 max-w-xl px-4">
                Your intelligent legal companion powered by advanced AI
            </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 w-full max-w-4xl px-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 p-4 md:p-6 rounded-2xl border border-blue-200 dark:border-blue-700/30 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">📄</div>
                <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-white mb-1 md:mb-2">Smart Analysis</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Upload PDFs for instant legal insights</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10 p-4 md:p-6 rounded-2xl border border-purple-200 dark:border-purple-700/30 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">💬</div>
                <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-white mb-1 md:mb-2">Ask Anything</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Get expert legal guidance instantly</p>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-800/10 p-4 md:p-6 rounded-2xl border border-amber-200 dark:border-amber-700/30 hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl mb-2 md:mb-3">🔒</div>
                <h3 className="font-bold text-sm md:text-base text-gray-800 dark:text-white mb-1 md:mb-2">Secure & Private</h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Your documents stay confidential</p>
            </div>
        </div>

        {/* AI Status Badge */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-brand-dark/50 backdrop-blur-sm rounded-full shadow-md border border-gray-200 dark:border-gray-700">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></span>
                <span className="text-gray-700 dark:text-gray-300 font-medium">AI Active</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-accent/10 to-brand-gold/10 dark:from-brand-accent/20 dark:to-brand-gold/20 backdrop-blur-sm rounded-full border border-brand-accent/20">
                <span className="text-brand-accent dark:text-white font-semibold">⚡ Powered by Gemini</span>
            </div>
        </div>
    </div>
);

const ChatPanel: React.FC<ChatPanelProps> = ({ chat, isLoading, onSendMessage }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages, isLoading]);

    if (!chat) {
        return (
            <div className="flex-1 flex flex-col bg-white/80 dark:bg-brand-dark-secondary/80 backdrop-blur-xl rounded-l-2xl md:rounded-l-none shadow-premium-lg">
                <WelcomeScreen />
                <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white/80 dark:bg-brand-dark-secondary/80 backdrop-blur-xl rounded-l-2xl md:rounded-l-none overflow-hidden shadow-premium-lg">
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-thin scrollbar-thumb-brand-accent/20 scrollbar-track-transparent">
                {chat.messages.length === 0 && (
                     <div className="text-center text-gray-500 dark:text-gray-400 p-8 bg-gray-50 dark:bg-brand-dark/50 rounded-xl border border-gray-200 dark:border-gray-700">
                        <p className="font-medium">Start your legal analysis</p>
                        <p className="text-sm mt-1">Upload a document or ask anything about legal matters</p>
                    </div>
                )}
                {chat.messages.map((message) => (
                    <MessageBubble key={message.timestamp} message={message} />
                ))}
                {isLoading && (
                    <MessageBubble 
                        message={{ role: 'model', parts: [{ text: '...' }], timestamp: Date.now()}} 
                        isLoading={true} 
                    />
                )}
                <div ref={messagesEndRef} />
            </div>
            <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
    );
};

export default ChatPanel;
