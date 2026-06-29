import React from 'react';
import { supabase, signInWithGoogle } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';

const AuthButton = () => {
  const { user } = useAuth();

  const handleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url;
    const fullName = user.user_metadata?.full_name || 'User';

    return (
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border border-gray-200" 
          />
        )}
        <span className="text-sm font-medium text-gray-700 hidden md:inline">{fullName}</span>
        <button
          onClick={handleSignOut}
          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
    >
      <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
      Sign in with Google
    </button>
  );
};

export default AuthButton;
