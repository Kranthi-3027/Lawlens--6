
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
    <div className="flex-1 flex flex-col justify-center items-center text-center p-8">
        <div className="bg-brand-accent/10 p-4 rounded-full mb-6">
            <div className="bg-brand-accent/20 p-4 rounded-full">
                <LogoIcon size={48} />
            </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Welcome to Lawlens</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
            Your personal AI legal assistant. Upload a document or ask a question to get started.
        </p>
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
            <div className="flex-1 flex flex-col bg-white dark:bg-brand-dark-secondary rounded-l-2xl md:rounded-l-none">
                <WelcomeScreen />
                <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-white dark:bg-brand-dark-secondary rounded-l-2xl md:rounded-l-none overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {chat.messages.length === 0 && (
                     <div className="text-center text-gray-500 dark:text-gray-400">
                        This is the beginning of your conversation. Upload a legal document or ask anything.
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
