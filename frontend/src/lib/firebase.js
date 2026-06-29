// Firebase initialization and Auth provider setup
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Add Gmail scope to request permission to send email directly via API
googleProvider.addScope(
  'https://www.googleapis.com/auth/gmail.send'
)

// offline access type is required to obtain a refresh_token from Google.
// prompt consent forces the OAuth screen to display scopes to the user every time.
googleProvider.setCustomParameters({
  access_type: 'offline',
  prompt: 'consent'
})
