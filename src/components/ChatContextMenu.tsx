
import React, { useState, useRef, useEffect } from 'react';
import { MoreVerticalIcon, EditIcon, TrashIcon } from './icons';

interface ChatContextMenuProps {
    chatId: string;
    currentTitle: string;
    onDelete: (chatId: string) => void;
    onRename: (chatId: string, newTitle: string) => void;
    isVisible: boolean;
    onVisibilityChange: (visible: boolean) => void;
}

const ChatContextMenu: React.FC<ChatContextMenuProps> = ({ chatId, currentTitle, onDelete, onRename, isVisible, onVisibilityChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [title, setTitle] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleToggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        const newState = !isOpen;
        setIsOpen(newState);
        onVisibilityChange(newState);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this chat?')) {
            onDelete(chatId);
        }
        setIsOpen(false);
        onVisibilityChange(false);
    };

    const handleRename = () => {
        if (title.trim()) {
            onRename(chatId, title.trim());
        }
        setIsRenaming(false);
        setTitle('');
    };

    const handleStartRenaming = (e: React.MouseEvent) => {
        e.stopPropagation();
        setTitle(currentTitle);
        setIsOpen(false);
        onVisibilityChange(false);
        // Small delay to ensure menu is closed before opening rename modal
        setTimeout(() => {
            setIsRenaming(true);
        }, 50);
    };

    const handleCancelRename = () => {
        setIsRenaming(false);
        setTitle('');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) && !isRenaming) {
                setIsOpen(false);
                onVisibilityChange(false);
            }
        };
        
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isRenaming, onVisibilityChange]);

    // Focus input when rename starts
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            // Small delay to ensure modal is rendered
            setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 100);
        }
    }, [isRenaming]);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={handleToggleMenu} 
                className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                <MoreVerticalIcon size={18} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-dark-secondary rounded-lg shadow-xl z-20 border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <button 
                        onClick={handleStartRenaming}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                        <EditIcon size={16} className="mr-2.5 text-blue-600 dark:text-blue-400" />
                        Rename
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 flex items-center transition-colors"
                    >
                        <TrashIcon size={16} className="mr-2.5" />
                        Delete
                    </button>
                </div>
            )}
            {isRenaming && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={(e) => {
                     e.stopPropagation();
                     handleCancelRename();
                 }}>
                    <div className="bg-white dark:bg-brand-dark-secondary rounded-2xl p-6 w-80 max-w-[90%] mx-4 shadow-2xl border border-gray-200 dark:border-gray-700 animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">Rename Chat</h3>
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') handleCancelRename();
                            }}
                            className="w-full px-4 py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-brand-dark text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:border-transparent transition-all"
                            placeholder="Enter chat name"
                        />
                        <div className="flex gap-3 mt-5">
                            <button
                                onClick={handleRename}
                                className="flex-1 bg-gradient-to-r from-brand-accent to-blue-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-600 hover:to-brand-accent transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleCancelRename}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatContextMenu;
