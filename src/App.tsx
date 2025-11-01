
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, provider } from './services/firebase.ts';
import { addChat, getChats, updateChat, deleteChat } from './services/firestore';
import type { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import SignInModal from './components/SignInModal';
import TermsAndConditionsModal from './components/TermsAndConditionsModal';
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
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [hasAgreedToTerms, setHasAgreedToTerms] = useState(false);

    const addNewChat = useCallback(async (userId: string, isInitialChat = false) => {
        const newChatData: Omit<ChatSession, 'id' | 'createdAt'> = {
            title: 'New Chat',
            messages: [],
        };
        
        const newChatId = await addChat(userId, newChatData);
        
        const newChat: ChatSession = {
            id: newChatId,
            ...newChatData,
            createdAt: new Date(),
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

    const loadChats = useCallback(async (currentUser: User) => {
        const userChats = await getChats(currentUser.uid);
        if (userChats.size > 0) {
            const sortedChats = new Map([...userChats.entries()].sort((a, b) => {
                const dateA = a[1].createdAt || 0;
                const dateB = b[1].createdAt || 0;
                return (dateB as number) - (dateA as number);
            }));
            setChats(sortedChats);
            setActiveChatId(sortedChats.keys().next().value || null);
        } else {
            await addNewChat(currentUser.uid, true);
        }
        setIsDataLoaded(true);
    }, [addNewChat]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setIsAuthLoading(false);
            if (currentUser) {
                loadChats(currentUser);
            } else {
                setChats(new Map());
                setActiveChatId(null);
                setIsDataLoaded(false);
                setHasAgreedToTerms(false);
            }
        });
        return () => unsubscribe();
    }, [loadChats]);


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

    const handleDeleteChat = async (chatId: string) => {
        if (!user) return;

        try {
            await deleteChat(user.uid, chatId);
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                newChats.delete(chatId);
                return newChats;
            });

            if (activeChatId === chatId) {
                const remainingChats = Array.from(chats.keys()).filter(id => id !== chatId);
                if (remainingChats.length > 0) {
                    setActiveChatId(remainingChats[0]);
                } else {
                    addNewChat(user.uid, true);
                }
            }
        } catch (error) {
            console.error("Error deleting chat:", error);
        }
    };

    const handleRenameChat = async (chatId: string, newTitle: string) => {
        if (!user) return;

        try {
            await updateChat(user.uid, chatId, { title: newTitle });
            setChats(prevChats => {
                const newChats = new Map(prevChats);
                const chatToUpdate = newChats.get(chatId);
                if (chatToUpdate) {
                    newChats.set(chatId, { ...chatToUpdate, title: newTitle });
                }
                return newChats;
            });
        } catch (error) {
            console.error("Error renaming chat:", error);
        }
    };

    const handleSendMessage = useCallback(async (newMessage: Message) => {
        if (!activeChatId || !user) return;

        const currentChat = chats.get(activeChatId);
        if (!currentChat) return;

        const updatedMessages = [...currentChat.messages, newMessage];
        let updatedChat = { ...currentChat, messages: updatedMessages };

        const isFirstMessage = currentChat.messages.length === 0;
        if (isFirstMessage && newMessage.parts[0]?.text) {
             const newTitle = newMessage.parts[0].text.substring(0, 30);
             updatedChat.title = newTitle.length === 30 ? `${newTitle}...` : newTitle;
        }

        const newChats = new Map(chats);
        newChats.set(activeChatId, updatedChat);
        setChats(newChats);
        setIsLoading(true);

        try {
            await updateChat(user.uid, activeChatId, {
                messages: updatedMessages,
                ...(isFirstMessage && { title: updatedChat.title })
            });

            const aiResponseText = await runChat(updatedMessages);
            const aiMessage: Message = {
                role: 'model',
                parts: [{ text: aiResponseText }],
                timestamp: Date.now()
            };

            await updateChat(user.uid, activeChatId, {
                messages: [...updatedMessages, aiMessage]
            });
            
            setChats(prevChats => {
                const finalChats = new Map(prevChats);
                const finalChat = finalChats.get(activeChatId);
                if (finalChat) {
                    finalChats.set(activeChatId, { 
                        ...finalChat, 
                        messages: [...finalChat.messages, aiMessage] 
                    });
                }
                return finalChats;
            });

        } catch (error) {
            console.error("Error handling message:", error);
            const errorMessage: Message = {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }],
                timestamp: Date.now()
            };
            setChats(prevChats => {
                const newChatsOnError = new Map(prevChats);
                const chatOnError = newChatsOnError.get(activeChatId);
                if (chatOnError) {
                    newChatsOnError.set(activeChatId, {
                        ...chatOnError,
                        messages: [...chatOnError.messages, errorMessage]
                    });
                }
                return newChatsOnError;
            });
        } finally {
            setIsLoading(false);
        }
    }, [activeChatId, chats, user]);
    
    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error: any) {
            console.error("Error signing in with Google:", error.message);
            alert(`Sign-in failed: ${error.message}`);
        }
    };

    const handleGuestSignIn = async () => {
        try {
            await signInAnonymously(auth);
        } catch (error: any) {
            console.error("Error signing in anonymously:", error.message);
            alert(`Guest sign-in failed: ${error.message}`);
        }
    };

    const handleSignOut = async () => {
        await signOut(auth);
    };
    
    const handleNewChat = () => {
        if (user) {
            addNewChat(user.uid);
        }
    };

    const handleAgreeToTerms = () => {
        setHasAgreedToTerms(true);
    };

    const activeChat = (activeChatId && chats.get(activeChatId)) || null;

    const renderLoading = () => (
        <div className="w-full h-full flex items-center justify-center bg-brand-light-secondary dark:bg-brand-dark">
            <LogoIcon size={64} className="animate-pulse text-brand-accent" />
        </div>
    );

    if (isAuthLoading || (user && !isDataLoaded)) {
        return renderLoading();
    }

    return (
        <div className="flex h-screen w-screen bg-brand-light-secondary dark:bg-brand-dark text-gray-800 dark:text-gray-200 font-sans">
            {!user ? (
                <SignInModal onSignIn={handleSignIn} onGuestSignIn={handleGuestSignIn} />
            ) : !hasAgreedToTerms ? (
                <TermsAndConditionsModal onAgree={handleAgreeToTerms} />
            ) : (
                <>
                    <Sidebar
                        chats={Array.from(chats.values())}
                        activeChatId={activeChatId}
                        user={user}
                        onNewChat={handleNewChat}
                        onSelectChat={selectChat}
                        onDeleteChat={handleDeleteChat}
                        onRenameChat={handleRenameChat}
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
