
import React from 'react';
import type { User } from 'firebase/auth';
import type { ChatSession } from '../types';
import { ChatHistory } from './ChatHistory';
import { UserProfile } from './UserProfile';
import { ThemeSwitcher } from './ThemeSwitcher';

interface SidebarProps {
    chats: ChatSession[];
    activeChatId: string | null;
    user: User | null;
    onNewChat: () => void;
    onSelectChat: (chatId: string) => void;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
    isOpen: boolean;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    onSignOut: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    chats, activeChatId, user, onNewChat, onSelectChat, 
    theme, onToggleTheme, isOpen, setIsOpen, onSignOut 
}) => {
    return (
        <aside className={`absolute md:relative z-30 h-full bg-brand-light dark:bg-brand-dark-secondary text-white transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64 flex-shrink-0 flex flex-col`}>
            <div className="flex-1 flex flex-col overflow-y-auto">
                <ChatHistory 
                    chats={chats}
                    activeChatId={activeChatId}
                    onNewChat={onNewChat}
                    onSelectChat={onSelectChat}
                />
            </div>

            <div className="p-4 border-t border-gray-700">
                <ThemeSwitcher theme={theme} onToggleTheme={onToggleTheme} />
                {user && <UserProfile user={user} onSignOut={() => { onSignOut(); setIsOpen(false); }} />}
            </div>
        </aside>
    );
};

export default Sidebar;
