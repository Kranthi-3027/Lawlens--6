
import React from 'react';
import type { User } from 'firebase/auth';
import { XIcon } from './icons';

interface UserProfileProps {
    user: User;
    onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
    return (
        <div className="flex items-center justify-between mt-4 p-2 rounded-md bg-gray-100 dark:bg-brand-dark/50 border border-gray-200 dark:border-transparent">
            <div className="flex items-center gap-2">
                <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full border-2 border-gray-200 dark:border-gray-600" />
                <span className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user.displayName || 'User'}</span>
            </div>
            <button onClick={onSignOut} className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors hover:bg-gray-200 dark:hover:bg-brand-dark rounded-md">
                <XIcon size={18} />
            </button>
        </div>
    );
};
