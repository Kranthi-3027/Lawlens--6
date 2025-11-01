
import React, { useState } from 'react';
import { GoogleIcon, LogoIcon } from './icons';

interface SignInModalProps {
    onSignIn: () => Promise<void>;
}

const SignInModal: React.FC<SignInModalProps> = ({ onSignIn }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignInClick = async () => {
        setIsLoading(true);
        try {
            await onSignIn();
        } catch (error) {
            console.error("Sign-in failed:", error);
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-8 border w-full max-w-md m-4 bg-white dark:bg-brand-dark-secondary rounded-lg shadow-lg text-center">
                <div className="flex flex-col items-center justify-center mb-6">
                    <LogoIcon size={48} className="text-brand-accent" />
                    <h1 className="text-2xl font-bold mt-4 text-gray-800 dark:text-gray-200">Welcome to Lawlens</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Your AI-powered legal assistant.</p>
                </div>
                
                <p className="mb-6 text-gray-700 dark:text-gray-300">Please sign in to continue.</p>

                <button
                    onClick={handleSignInClick}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Signing In...
                        </>
                    ) : (
                        <>
                            <GoogleIcon className="mr-3" />
                            Sign In with Google
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default SignInModal;
