// Google Auth button using Firebase Auth and storing Gmail accessToken in sessionStorage
import React from 'react'
import { signInWithPopup, signOut } from 'firebase/auth'
import { auth, googleProvider } from '../lib/firebase'
import { useAuth } from '../hooks/useAuth'

export function AuthButton() {
  const { user } = useAuth()

  async function handleSignIn() {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      // Store Google OAuth Access Token for the Gmail API send flow
      const gmailToken = result._tokenResponse?.oauthAccessToken
      if (gmailToken) {
        sessionStorage.setItem('gmail_token', gmailToken)
      }
    } catch (err) {
      console.error('Sign in failed:', err.message)
    }
  }

  async function handleSignOut() {
    sessionStorage.removeItem('gmail_token')
    await signOut(auth)
  }

  if (user) {
    const avatarUrl = user.photoURL
    const fullName = user.displayName || 'User'

    return (
      <div className="flex items-center gap-3">
        {avatarUrl && (
          <img 
            src={avatarUrl} 
            alt={fullName} 
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
    )
  }

  return (
    <button
      onClick={handleSignIn}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium text-gray-700"
    >
      <svg width="18" height="18" viewBox="0 0 48 48" className="w-4 h-4">
        <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.2l6.8-6.8C35.7 2.3 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.3l7.9 6.1C12.4 13 17.7 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17z"/>
        <path fill="#FBBC05" d="M10.5 28.6A14.8 14.8 0 0 1 9.5 24c0-1.6.3-3.2.8-4.6L2.4 13.3A23.9 23.9 0 0 0 0 24c0 3.8.9 7.4 2.6 10.6l7.9-6z"/>
        <path fill="#34A853" d="M24 48c6.2 0 11.4-2 15.2-5.5l-7.5-5.8c-2 1.4-4.6 2.2-7.7 2.2-6.3 0-11.6-4.2-13.5-9.9l-7.9 6C6.5 42.6 14.6 48 24 48z"/>
      </svg>
      Sign in with Google
    </button>
  )
}

export default AuthButton
