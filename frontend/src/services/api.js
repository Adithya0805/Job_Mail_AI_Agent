import { supabase } from '../lib/supabase';

// All API calls route through BASE_URL — set VITE_API_URL in env for production
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generateEmail = async (payload) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail?.error || data.detail || 'Failed to generate email');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};

export const sendEmail = async (emailData) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail?.error || data.detail || 'Failed to send email');
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};
