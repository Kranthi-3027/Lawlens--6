
import React from 'react';
import type { User } from 'firebase/auth';
import { XIcon } from './icons';

interface UserProfileProps {
    user: User;
    onSignOut: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut }) => {
    return (
        <div className="flex items-center justify-between mt-4 p-2 rounded-md bg-gray-200/50 dark:bg-brand-dark/50">
            <div className="flex items-center gap-2">
                <img src={user.photoURL || undefined} alt={user.displayName || 'User'} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-semibold truncate">{user.displayName || 'User'}</span>
            </div>
            <button onClick={onSignOut} className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors">
                <XIcon size={18} />
            </button>
        </div>
    );
};
