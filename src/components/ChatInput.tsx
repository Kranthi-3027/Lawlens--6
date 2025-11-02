import React, { useState, useRef, useEffect } from 'react';
import type { Message } from '../types';
import { fileToGenerativePart, isSupportedFile } from '../utils/file';
import { PlusIcon, SendIcon, PaperclipIcon, XIcon, MicrophoneIcon } from './icons';

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onstart: () => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: { new(): SpeechRecognition };
        webkitSpeechRecognition: { new(): SpeechRecognition };
    }
}


interface ChatInputProps {
    onSendMessage: (message: Message, systemMessage?: string) => void;
    isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
    const [text, setText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [micError, setMicError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        // Cleanup function to stop recognition if the component unmounts
        return () => {
            recognitionRef.current?.stop();
        };
    }, []);

    const handleMicClick = () => {
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognitionAPI) {
            setMicError("Speech recognition is not supported by your browser.");
            return;
        }

        if (isRecording) {
            recognitionRef.current?.stop();
            return;
        }
        
        setMicError(null);
        setText('');

        const recognition = new SpeechRecognitionAPI();
        recognitionRef.current = recognition;

        recognition.continuous = false;  // Changed to false to avoid repeated words
        recognition.interimResults = false;  // Changed to false to get only final results
        recognition.lang = 'en-US';

        recognition.onstart = () => {
            setIsRecording(true);
        };

        recognition.onresult = (event) => {
            // Get only the final transcript to avoid duplicates
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                }
            }
            
            // Append to existing text if there is any
            if (finalTranscript) {
                setText(prevText => {
                    const newText = prevText ? prevText + ' ' + finalTranscript : finalTranscript;
                    return newText.trim();
                });
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error:", event.error);
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setMicError("Microphone access was denied. Please allow it in your browser settings.");
            } else {
                 setMicError(`An error occurred during speech recognition: ${event.error}`);
            }
            setIsRecording(false);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            recognitionRef.current = null;
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Error starting recognition:", e);
            setMicError("Could not start microphone. Please check permissions and try again.");
            if (recognitionRef.current) {
                recognitionRef.current = null;
            }
        }
    };


    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile && isSupportedFile(selectedFile)) {
            setFile(selectedFile);
        } else if (selectedFile) {
            alert('Unsupported file type. Please upload images (JPG, PNG), Word documents (DOCX), or PDFs.');
        }
    };

    const triggerFileIput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!text.trim() && !file) || isLoading) return;

        const parts = [];
        let systemMessage: string | undefined;
        
        if (file) {
            const result = await fileToGenerativePart(file);
            parts.push(result.part);
            systemMessage = result.systemMessage;
        }
        if (text.trim()) {
            parts.push({ text: text.trim() });
        }
        
        const newMessage: Message = {
            role: 'user',
            parts: parts,
            timestamp: Date.now(),
        };

        onSendMessage(newMessage, systemMessage);
        setText('');
        setFile(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="p-4 md:p-6 bg-white dark:bg-brand-dark-secondary border-t border-gray-200 dark:border-white/10">
            <form onSubmit={handleSubmit} className="relative">
                {file && (
                    <div className="absolute bottom-full left-0 mb-2 w-full">
                         <div className="bg-blue-100 dark:bg-blue-900/50 border border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200 text-sm rounded-lg p-2 flex justify-between items-center max-w-xs mx-auto">
                            <div className="flex items-center gap-2 truncate">
                                <PaperclipIcon />
                                <span className="truncate">{file.name}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    setFile(null);
                                    if(fileInputRef.current) fileInputRef.current.value = '';
                                }}
                                className="p-1 hover:bg-black/10 rounded-full"
                            >
                                <XIcon size={16} />
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex items-center bg-gray-100 dark:bg-brand-dark rounded-full px-2 py-1.5 shadow-inner">
                    <button type="button" onClick={triggerFileIput} className="p-2 text-gray-500 hover:text-brand-accent dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isLoading || isRecording}>
                        <PlusIcon />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="image/png, image/jpeg, image/webp, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf"
                    />
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={isRecording ? "Listening..." : "Ask anything..."}
                        className="w-full bg-transparent focus:outline-none px-2 text-sm text-gray-800 dark:text-gray-200"
                        disabled={isLoading || isRecording}
                    />
                    <button
                        type="button"
                        onClick={handleMicClick}
                        disabled={isLoading}
                        aria-label={isRecording ? 'Stop recording' : 'Start recording'}
                        className={`p-3 rounded-full transition-all duration-200 ${
                            isRecording
                                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                                : 'text-gray-500 hover:text-brand-accent hover:bg-brand-accent/10 dark:hover:text-white dark:hover:bg-white/10'
                        }`}
                    >
                        <MicrophoneIcon size={20} />
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || (!text.trim() && !file) || isRecording}
                        className="bg-brand-accent text-white rounded-full p-2.5 disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
                    >
                        <SendIcon />
                    </button>
                </div>
            </form>
            {micError && (
                <p className="text-center text-red-500 text-xs mt-2">{micError}</p>
            )}
        </div>
    );
};

export default ChatInput;