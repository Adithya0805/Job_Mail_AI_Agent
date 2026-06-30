// Client-side bulk application logging hook (No Gmail send API required)
import { useState } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useBulkSend() {
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);

  const startSend = async (selected_emails) => {
    setSending(true);
    setComplete(false);
    setTotal(selected_emails.length);
    setCurrentIndex(0);
    setStats({ sent: 0, failed: 0 });

    const initialResults = selected_emails.map((email, idx) => ({
      index: idx,
      company: email.company_name || 'Company',
      status: idx === 0 ? 'sending' : 'queued',
      message_id: null,
      error: null,
      email_data: email
    }));
    setSendResults(initialResults);

    let uuid = localStorage.getItem('client_uuid');
    if (!uuid) {
      uuid = 'user_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('client_uuid', uuid);
    }

    // Sequence logging of applications to database in a smooth loop
    for (let idx = 0; idx < selected_emails.length; idx++) {
      const email = selected_emails[idx];

      try {
        const response = await fetch(`${BASE_URL}/api/applications/log`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-User-ID': uuid
          },
          body: JSON.stringify({
            to: email.to || email.hr_email,
            subject: email.subject,
            body: email.body,
            sign_off: email.sign_off,
            company_name: email.company_name || 'Unknown Company',
            role: email.role || 'Unknown Role',
            mode_used: email.mode_used || 'unknown',
            matched_skills: email.matched_skills || [],
            word_count: email.word_count || 0
          })
        });

        if (!response.ok) throw new Error("Database logging failed");

        setSendResults(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], status: 'sent' };
          if (idx + 1 < next.length) next[idx + 1].status = 'sending';
          return next;
        });
        setStats(s => ({ ...s, sent: s.sent + 1 }));
      } catch (err) {
        setSendResults(prev => {
          const next = [...prev];
          next[idx] = { ...next[idx], status: 'failed', error: err.message };
          if (idx + 1 < next.length) next[idx + 1].status = 'sending';
          return next;
        });
        setStats(s => ({ ...s, failed: s.failed + 1 }));
      }

      setCurrentIndex(idx + 1);
      // Brief aesthetic sleep
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    setComplete(true);
    setSending(false);
  };

  const reset = () => {
    setSending(false);
    setComplete(false);
    setSendResults([]);
    setCurrentIndex(0);
    setTotal(0);
    setStats({ sent: 0, failed: 0 });
  };

  return { startSend, reset, sending, complete, sendResults, currentIndex, total, stats };
}
