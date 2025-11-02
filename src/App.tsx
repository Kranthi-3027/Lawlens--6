
import React, { useState, useEffect, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signOut, signInWithPopup, signInAnonymously } from 'firebase/auth';
import { auth, provider } from './services/firebase.ts';
import { addChat, getChats, updateChat, deleteChat, getUserProfile, setTermsAccepted } from './services/firestore';
import type { ChatSession, Message } from './types';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import SignInModal from './components/SignInModal';
import TermsAndConditionsModal from './components/TermsAndConditionsModal';
import { runChat } from './services/gemini';
import { MenuIcon, XIcon, LogoIcon } from './components/icons';

const App: React.FC = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark');  // Changed default to 'dark'
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
        // Check if user has accepted terms
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile?.hasAcceptedTerms) {
            setHasAgreedToTerms(true);
        }

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

    const handleSendMessage = useCallback(async (newMessage: Message, systemMessage?: string) => {
        if (!activeChatId || !user) return;

        const currentChat = chats.get(activeChatId);
        if (!currentChat) return;

        let updatedMessages = [...currentChat.messages, newMessage];
        
        // Add system message if present (for errors, notifications)
        if (systemMessage) {
            const sysMsg: Message = {
                role: 'system',
                parts: [{ text: systemMessage }],
                timestamp: Date.now()
            };
            updatedMessages.push(sysMsg);
        }
        
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

            // Only send to Gemini if not a pure system error message
            const shouldCallAI = !systemMessage || !systemMessage.includes('ERROR:');
            
            if (shouldCallAI) {
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
            }

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

    const handleAgreeToTerms = async () => {
        if (user) {
            await setTermsAccepted(user.uid);
            setHasAgreedToTerms(true);
        }
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
        <div className="flex h-screen w-screen bg-gradient-to-br from-brand-light via-brand-light-secondary to-gray-100 dark:from-brand-dark dark:via-brand-dark-secondary dark:to-[#151b35] text-gray-800 dark:text-gray-200 font-sans">
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
                        {/* Enhanced Mobile Header */}
                        <div className="p-4 md:hidden flex items-center justify-between bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 shadow-2xl border-b border-white/20 dark:border-white/10 backdrop-blur-lg">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <button 
                                    onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-200 shadow-lg backdrop-blur-sm"
                                >
                                    {isSidebarOpen ? <XIcon className="text-white" size={20} /> : <MenuIcon className="text-white" size={20} />}
                                </button>
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                    <div className="bg-white/95 p-2 rounded-xl shadow-lg">
                                        <LogoIcon size={22} className="text-blue-600" />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <h1 className="text-sm font-bold text-white truncate">
                                            {activeChat?.title || 'Lawlens'}
                                        </h1>
                                        <span className="text-xs text-white/70 font-medium">AI Assistant</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 ml-2">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/20 dark:bg-white/10 rounded-full backdrop-blur-sm">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></span>
                                    <span className="text-xs text-white/90 font-semibold">Online</span>
                                </div>
                            </div>
                        </div>

                        {/* Premium Desktop Header */}
                        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 shadow-2xl border-b border-white/20 dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="bg-white/95 p-2.5 rounded-xl shadow-xl">
                                    <LogoIcon size={28} className="text-blue-600" />
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-2xl font-extrabold text-white tracking-tight">
                                        {activeChat?.title || 'LAWLENS'}
                                    </h1>
                                    <p className="text-sm text-white/80 font-medium">Your Legal Document Assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-white/90 text-sm font-medium">⚡ Powered by</span>
                                <span className="text-white text-base font-bold bg-white/20 px-3 py-1 rounded-lg backdrop-blur-sm">Gemini</span>
                            </div>
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
