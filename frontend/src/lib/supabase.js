import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Wrapper for google sign in to ensure correct scopes
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      // Need gmail.send to send emails directly via user's account
      scopes: 'email profile https://www.googleapis.com/auth/gmail.send',
      queryParams: { 
        // offline access type is required to obtain a refresh_token from Google.
        // This allows our backend to refresh the Gmail token when it expires.
        access_type: 'offline', 
        prompt: 'consent' 
      },
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
};
