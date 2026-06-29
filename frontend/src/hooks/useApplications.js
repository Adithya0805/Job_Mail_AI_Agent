// Applications hook updated to use Firebase Auth token
import { useState } from 'react';
import { auth } from '../lib/firebase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const stats = {
    total: applications.length,
    sent: applications.filter(a => a.status === 'sent').length,
    replied: applications.filter(a => a.status === 'replied').length,
    interview: applications.filter(a => a.status === 'interview').length,
    offer: applications.filter(a => a.status === 'offer').length,
    rejected: applications.filter(a => a.status === 'rejected').length
  };

  const getHeaders = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    const token = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
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

  return { applications, loading, error, stats, fetchApplications, updateStatus, deleteApplication };
}
