
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, provider } from './services/firebase';
import type { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import SignInModal from './components/SignInModal';
import { runChat } from './services/gemini';
import { MenuIcon, XIcon, LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
    const [chats, setChats] = useState<Map<string, ChatSession>>(new Map());
    const [activeChatId, setActiveChatId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const addNewChat = useCallback((isInitialChat = false) => {
        const newChatId = `chat-${Date.now()}`;
        const newChat: ChatSession = {
            id: newChatId,
            title: 'New Chat',
            messages: [],
        };
        setChats(prevChats => {
            const newChats = new Map(prevChats);
            newChats.set(newChatId, newChat);
            return newChats;
        });
        setActiveChatId(newChatId);
        if (!isInitialChat) {
            setIsSidebarOpen(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setIsAuthLoading(false);
            if (user && chats.size === 0) {
                addNewChat(true);
            }
        });
        return () => unsubscribe();
    }, [addNewChat, chats.size]);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === 'light' ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    const selectChat = (chatId: string) => {
        setActiveChatId(chatId);
        setIsSidebarOpen(false);
    };

    const handleSendMessage = useCallback(async (newMessage: Message) => {
        if (!activeChatId) return;

        const currentChat = chats.get(activeChatId);
        if (!currentChat) return;

        const updatedMessages = [...currentChat.messages, newMessage];
        let updatedChat = { ...currentChat, messages: updatedMessages };

        if (currentChat.messages.length === 0 && newMessage.parts[0]?.text) {
             const newTitle = newMessage.parts[0].text.substring(0, 30);
             updatedChat = { 
                ...updatedChat, 
                title: newTitle.length === 30 ? `${newTitle}...` : newTitle 
            };
        }

        const newChats = new Map(chats);
        newChats.set(activeChatId, updatedChat);
        setChats(newChats);
        setIsLoading(true);

        try {
            const aiResponseText = await runChat(updatedMessages);
            const aiMessage: Message = {
                role: 'model',
                parts: [{ text: aiResponseText }],
                timestamp: Date.now()
            };
            
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                const finalChat = newChats.get(activeChatId);
                if (finalChat) {
                    const finalMessages = [...finalChat.messages, aiMessage];
                    newChats.set(activeChatId, { ...finalChat, messages: finalMessages });
                }
                return newChats;
            });
        } catch (error) {
            console.error("Error from Gemini API:", error);
            const errorMessage: Message = {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }],
                timestamp: Date.now()
            };
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                const finalChat = newChats.get(activeChatId);
                if (finalChat) {
                    const finalMessages = [...finalChat.messages, errorMessage];
                    newChats.set(activeChatId, { ...finalChat, messages: finalMessages });
                }
                return newChats;
            });
        } finally {
            setIsLoading(false);
        }
    }, [activeChatId, chats]);
    
    const handleSignIn = async () => {
        setIsAuthLoading(true);
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error signing in with Google: ", error);
            setIsAuthLoading(false);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
        setChats(new Map());
        setActiveChatId(null);
    };

    const activeChat = (activeChatId && chats.get(activeChatId)) || null;

    const renderLoading = () => (
        <div className="w-full h-full flex items-center justify-center bg-brand-light-secondary dark:bg-brand-dark">
            <LogoIcon size={64} className="animate-pulse text-brand-accent" />
        </div>
    );

    return (
        <div className="flex h-screen w-screen bg-brand-light-secondary dark:bg-brand-dark text-gray-800 dark:text-gray-200 font-sans">
            {isAuthLoading ? renderLoading() : !user ? <SignInModal onSignIn={handleSignIn} /> : (
                <>
                    <Sidebar
                        chats={Array.from(chats.values())}
                        activeChatId={activeChatId}
                        user={user}
                        onNewChat={addNewChat}
                        onSelectChat={selectChat}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        onSignOut={handleSignOut}
                    />

                    <main className="flex-1 flex flex-col transition-all duration-300">
                        <div className="p-2 md:hidden flex items-center bg-white dark:bg-brand-dark-secondary shadow-md">
                            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                                {isSidebarOpen ? <XIcon /> : <MenuIcon />}
                            </button>
                            <h1 className="text-lg font-semibold ml-4">{activeChat?.title || 'Lawlens'}</h1>
                        </div>

                        <ChatPanel
                            chat={activeChat}
                            isLoading={isLoading}
                            onSendMessage={handleSendMessage}
                        />
                    </main>
                </>
            )}
        </div>
    );
};

export default App;
