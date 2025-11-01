
import React from 'react';
import { SunIcon, MoonIcon } from './icons';

interface ThemeSwitcherProps {
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, onToggleTheme }) => {
    return (
        <div className="flex items-center justify-center p-2 bg-gray-200/50 dark:bg-brand-dark/50 rounded-md">
            <button 
                onClick={onToggleTheme}
                className="flex items-center justify-center w-full p-2 rounded-md transition-colors text-sm font-medium"
            >
                <span className={`flex items-center gap-2 ${theme === 'light' ? 'text-gray-800' : 'text-gray-400'}`}>
                    <SunIcon size={18} /> Light
                </span>
                <div 
                    className={`relative w-12 h-6 rounded-full mx-3 transition-colors ${theme === 'light' ? 'bg-blue-500' : 'bg-gray-700'}`}>
                    <span 
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : ''}`}>
                    </span>
                </div>
                <span className={`flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-500'}`}>
                    <MoonIcon size={16} /> Dark
                </span>
            </button>
        </div>
    );
};
