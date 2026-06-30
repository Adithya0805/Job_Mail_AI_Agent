// Applications hook using anonymous client UUID headers and loading on mount
import { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const stats = {
    total: applications.length,
    sent: applications.filter(a => a.status === 'sent' || a.status === 'copied').length,
    replied: applications.filter(a => a.status === 'replied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getHeaders = async () => {
    let uuid = localStorage.getItem('client_uuid');
    if (!uuid) {
      uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('client_uuid', uuid);
    }
    return {
      'Content-Type': 'application/json',
      'X-User-ID': uuid
    };
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}/api/applications`, { headers });
      if (!res.ok) throw new Error('Failed to fetch applications');
      const data = await res.json();
      setApplications(data);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    const previous = [...applications];
    setApplications(apps => apps.map(app => app.id === id ? { ...app, status } : app));
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}/api/applications/${id}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed to update status');
    } catch (err) {
      setApplications(previous);
      setError('Failed to update status');
    }
  };

  const deleteApplication = async (id) => {
    const previous = [...applications];
    setApplications(apps => apps.filter(app => app.id !== id));
    try {
      const headers = await getHeaders();
      const res = await fetch(`${BASE_URL}/api/applications/${id}`, {
        method: 'DELETE',
        headers
      });
      if (!res.ok) throw new Error('Failed to delete');
    } catch (err) {
      setApplications(previous);
      setError('Failed to delete application');
    }
  };

  // Automatically fetch applications once anonymous client session is established
  useEffect(() => {
    const uuid = localStorage.getItem('client_uuid');
    if (uuid) {
      fetchApplications();
    } else {
      // Small delay to wait for useAuth to initialize client_uuid on first load
      const timer = setTimeout(() => {
        fetchApplications();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  return { applications, loading, error, stats, fetchApplications, updateStatus, deleteApplication };
}
