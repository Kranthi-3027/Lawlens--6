
import React from 'react';
import type { User } from 'firebase/auth';
import type { ChatSession } from '../types';
import { ChatHistory } from './ChatHistory';
import { UserProfile } from './UserProfile';
import { ThemeSwitcher } from './ThemeSwitcher';
import { XIcon } from './icons';

interface SidebarProps {
    chats: ChatSession[];
    activeChatId: string | null;
    user: User | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
    onRenameChat: (chatId: string, newTitle: string) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    chats, activeChatId, user, onNewChat, onSelectChat, 
    onDeleteChat, onRenameChat, theme, onToggleTheme, 
    isOpen, setIsOpen, onSignOut 
}) => {
    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
            
            <aside className={`fixed md:relative z-30 h-full bg-gray-50 dark:bg-brand-dark-secondary text-gray-800 dark:text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 md:w-64 flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 shadow-xl md:shadow-none`}>
                {/* Mobile close button */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                <div className="flex-1 flex flex-col overflow-y-auto">
                    <ChatHistory 
                        chats={chats}
                        activeChatId={activeChatId}
                        onNewChat={onNewChat}
                        onSelectChat={onSelectChat}
                        onDeleteChat={onDeleteChat}
                        onRenameChat={onRenameChat}
                    />
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-brand-dark">
                    <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
                    {user && <UserProfile user={user} onSignOut={() => { onSignOut(); setIsOpen(false); }} />}
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
