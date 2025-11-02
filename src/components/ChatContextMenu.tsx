
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

    const handleToggleMenu = () => {
        const newState = !isOpen;
        setIsOpen(newState);
        onVisibilityChange(newState);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this chat?')) {
            onDelete(chatId);
        }
        setIsOpen(false);
        onVisibilityChange(false);
    };

    const handleRename = () => {
        onRename(chatId, title);
        setIsRenaming(false);
        setIsOpen(false);
        onVisibilityChange(false);
    };

    const handleStartRenaming = () => {
        setTitle(currentTitle);
        setIsRenaming(true);
        setIsOpen(false);
        onVisibilityChange(false);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onVisibilityChange(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onVisibilityChange]);

    // Focus input when rename starts
    useEffect(() => {
        if (isRenaming) {
            inputRef.current?.focus();
        }
    }, [isRenaming]);

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={handleToggleMenu} 
                className={`p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 ${isOpen ? 'bg-gray-200 dark:bg-gray-700' : ''}`}
            >
                <MoreVerticalIcon size={18} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-brand-dark-secondary rounded-md shadow-lg z-20 border border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={handleStartRenaming}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center rounded-t-md"
                    >
                        <EditIcon size={16} className="mr-2" />
                        Rename
                    </button>
                    <button 
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center rounded-b-md"
                    >
                        <TrashIcon size={16} className="mr-2" />
                        Delete
                    </button>
                </div>
            )}
            {isRenaming && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleRename}>
                    <div className="bg-white dark:bg-brand-dark-secondary rounded-lg p-4 w-80 max-w-full mx-4" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">Rename Chat</h3>
                        <input
                            ref={inputRef}
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleRename();
                                if (e.key === 'Escape') setIsRenaming(false);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-brand-dark text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
                            placeholder="Enter chat name"
                        />
                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleRename}
                                className="flex-1 bg-brand-accent text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                            >
                                Save
                            </button>
                            <button
                                onClick={() => setIsRenaming(false)}
                                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
