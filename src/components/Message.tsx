
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../types';
import { LogoIcon, SpeakerIcon } from './icons';
import { convertTextToSpeech } from '../services/tts';

interface MessageBubbleProps {
    message: Message;
    isLoading?: boolean;
}

const LoadingDots: React.FC = () => (
    <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
    </div>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLoading = false }) => {
    const isUser = message.role === 'user';
    const isSystem = message.role === 'system';
    const [isPlaying, setIsPlaying] = useState(false);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const textContent = message.parts.map(p => p.text).filter(Boolean).join('\n');

    const handlePlayAudio = async () => {
        if (isPlaying && audio) {
            audio.pause();
            audio.currentTime = 0;
            setIsPlaying(false);
            return;
        }

        try {
            const audioContent = await convertTextToSpeech(textContent);
            const audio = new Audio(`data:audio/mp3;base64,${audioContent}`);
            setAudio(audio);
            audio.play();
            setIsPlaying(true);
            audio.onended = () => {
                setIsPlaying(false);
            };
        } catch (error) {
            console.error('Failed to play audio:', error);
        }
    };

    // System message (centered, between user and AI)
    if (isSystem) {
        return (
            <div className="flex justify-center items-center my-2 px-2 md:px-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 rounded-lg px-3 py-2 md:px-4 md:py-2 max-w-full md:max-w-xl text-center">
                    <p className="text-xs md:text-sm font-medium whitespace-pre-wrap">{textContent}</p>
                </div>
            </div>
        );
    }

    if (isUser) {
        return (
            <div className="flex justify-end items-start gap-2 md:gap-3 px-2 md:px-4">
                <div className="bg-brand-accent text-white rounded-2xl rounded-br-none px-3 py-2 md:px-4 md:py-3 max-w-[85%] md:max-w-xl shadow-md">
                    <p className="text-sm md:text-base whitespace-pre-wrap break-words">{textContent}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-start items-start gap-2 md:gap-3 px-2 md:px-4">
            <div className="w-7 h-7 md:w-8 md:h-8 flex-shrink-0 bg-gray-200 dark:bg-brand-dark flex items-center justify-center rounded-full mt-1">
                <LogoIcon size={14} className="md:hidden" />
                <LogoIcon size={16} className="hidden md:block" />
            </div>
            <div className="relative bg-gray-100 dark:bg-brand-dark text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-none px-3 py-2 md:px-4 md:py-3 max-w-[85%] md:max-w-2xl shadow-sm">
                {isLoading ? (
                    <LoadingDots />
                ) : (
                    <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
                        <ReactMarkdown
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-lg md:text-xl font-bold mt-3 md:mt-4 mb-2 text-gray-900 dark:text-white" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base md:text-lg font-bold mt-2 md:mt-3 mb-2 text-gray-900 dark:text-white" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm md:text-md font-bold mt-2 mb-1 text-gray-900 dark:text-white" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-sm font-bold mt-2 mb-1 text-gray-800 dark:text-gray-200" {...props} />,
                                p: ({node, ...props}) => <p className="my-1.5 md:my-2 text-sm md:text-base text-gray-800 dark:text-gray-200 break-words" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc list-inside my-2 space-y-1 text-sm md:text-base text-gray-800 dark:text-gray-200" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2 space-y-1 text-sm md:text-base text-gray-800 dark:text-gray-200" {...props} />,
                                li: ({node, ...props}) => <li className="ml-2 text-sm md:text-base text-gray-800 dark:text-gray-200" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-gray-900 dark:text-white" {...props} />,
                                em: ({node, ...props}) => <em className="italic text-gray-700 dark:text-gray-300" {...props} />,
                                hr: ({node, ...props}) => <hr className="my-3 md:my-4 border-gray-300 dark:border-gray-600" {...props} />,
                                code: ({node, inline, ...props}: any) => 
                                    inline ? (
                                        <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs md:text-sm text-gray-900 dark:text-gray-100" {...props} />
                                    ) : (
                                        <code className="block bg-gray-200 dark:bg-gray-700 p-2 rounded my-2 text-xs md:text-sm text-gray-900 dark:text-gray-100 overflow-x-auto" {...props} />
                                    ),
                            }}
                        >
                            {textContent}
                        </ReactMarkdown>
                    </div>
                )}
                {!isLoading && textContent && (
                    <button onClick={handlePlayAudio} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Play audio">
                        <SpeakerIcon size={14} className="md:hidden" />
                        <SpeakerIcon size={16} className="hidden md:block" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default MessageBubble;
