// API service for interacting with the backend using Firebase Auth tokens
import { auth } from '../lib/firebase'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeader() {
  const user = auth.currentUser
  if (!user) throw new Error('Not authenticated')
  // Firebase getIdToken auto-refreshes when expired. No manual token management needed.
  const token = await user.getIdToken()
  return { 'Authorization': `Bearer ${token}` }
}

export const generateEmail = async (payload) => {
  try {
    const headers = await getAuthHeader()
    const response = await fetch(`${BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Extract detailed error if available
      const errorMsg = data.detail?.detail || data.detail?.error || data.detail || 'Failed to generate email';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};

export const sendEmail = async (emailData) => {
  try {
    const headers = await getAuthHeader()
    const gmailToken = sessionStorage.getItem('gmail_token')
    
    const response = await fetch(`${BASE_URL}/api/send-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
        'X-Gmail-Token': gmailToken || ''
      },
      body: JSON.stringify(emailData),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail?.detail || data.detail?.error || data.detail || 'Failed to send email';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};
