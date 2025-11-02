
import React, { useState } from 'react';
import { GoogleIcon, LogoIcon } from './icons';

interface SignInModalProps {
    onSignIn: () => Promise<void>;
    onGuestSignIn: () => void;
}

const SignInModal: React.FC<SignInModalProps> = ({ onSignIn, onGuestSignIn }) => {
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
        <div className="fixed inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 dark:from-blue-900 dark:via-indigo-900 dark:to-purple-900 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative p-8 border border-white/20 w-full max-w-md m-4 bg-white/10 dark:bg-black/30 backdrop-blur-2xl rounded-2xl shadow-2xl text-center">
                <div className="flex flex-col items-center justify-center mb-6">
                    <div className="bg-white/95 p-4 rounded-2xl shadow-xl mb-4">
                        <LogoIcon size={48} className="text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-white drop-shadow-lg">Welcome to Lawlens</h1>
                    <p className="text-white/90 mt-2 font-medium">Your AI-powered legal assistant.</p>
                </div>
                
                <p className="mb-6 text-white/80">Please sign in to continue.</p>

                <button
                    onClick={handleSignInClick}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-white hover:bg-gray-100 text-gray-800 font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                <div className="my-4 flex items-center">
                    <div className="flex-grow border-t border-white/30"></div>
                    <span className="flex-shrink mx-4 text-white/70 text-sm font-medium">OR</span>
                    <div className="flex-grow border-t border-white/30"></div>
                </div>

                <button
                    onClick={onGuestSignIn}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 font-bold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                    Continue as Guest
                </button>
            </div>
        </div>
    );
};

export default SignInModal;
