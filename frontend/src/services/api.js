// API service for interacting with the backend using anonymous client UUID headers
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function getAuthHeader() {
  const uuid = localStorage.getItem('client_uuid')
  if (!uuid) throw new Error('Client session ID missing')
  return { 'X-User-ID': uuid }
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
      const errorMsg = data.detail?.detail || data.detail?.error || data.detail || 'Failed to generate email';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};

// Logs copy events to the PostgreSQL database for dashboard tracking
export const sendEmail = async (emailData) => {
  try {
    const headers = await getAuthHeader()
    
    const payload = {
      to: emailData.to,
      subject: emailData.subject,
      body: emailData.body,
      sign_off: emailData.sign_off,
      company_name: emailData.company_name || 'Unknown Company',
      role: emailData.role || 'Unknown Role',
      mode_used: emailData.mode_used || 'unknown',
      matched_skills: emailData.matched_skills || [],
      word_count: emailData.word_count || 0
    }

    const response = await fetch(`${BASE_URL}/api/applications/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.detail?.detail || data.detail?.error || data.detail || 'Failed to log application';
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    throw new Error(error.message || 'Network error occurred');
  }
};
