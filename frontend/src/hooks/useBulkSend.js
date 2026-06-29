import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useBulkSend() {
  const [sending, setSending] = useState(false);
  const [complete, setComplete] = useState(false);
  const [sendResults, setSendResults] = useState([]);
  const [stats, setStats] = useState({ sent: 0, failed: 0 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  
  const abortControllerRef = useRef(null);

  const startSend = async (selected_emails) => {
    setSending(true);
    setComplete(false);
    setTotal(selected_emails.length);
    setCurrentIndex(0);
    setStats({ sent: 0, failed: 0 });

    const initialResults = selected_emails.map((email, idx) => ({
      index: idx,
      company: email.company_name,
      status: idx === 0 ? 'sending' : 'queued',
      message_id: null,
      error: null,
      email_data: email
    }));
    setSendResults(initialResults);

    abortControllerRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${BASE_URL}/api/bulk/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ emails: selected_emails }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("Failed to start send process");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const event = JSON.parse(line.substring(6));
              handleEvent(event);
            } catch (e) {
              console.error("Failed to parse SSE event", e);
            }
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error("Send stream error:", err);
        setSendResults(prev => prev.map(r =>
          r.status === 'queued' || r.status === 'sending'
            ? { ...r, status: 'failed', error: 'Stream interrupted' }
            : r
        ));
      }
      setComplete(true);
      setSending(false);
    }
  };

  const handleEvent = (event) => {
    if (event.event === 'sent') {
      setCurrentIndex(event.index + 1);
      setSendResults(prev => {
        const next = [...prev];
        next[event.index] = { ...next[event.index], status: 'sent', message_id: event.message_id };
        if (event.index + 1 < next.length) next[event.index + 1].status = 'sending';
        return next;
      });
      setStats(s => ({ ...s, sent: s.sent + 1 }));
    } else if (event.event === 'send_error') {
      setCurrentIndex(event.index + 1);
      setSendResults(prev => {
        const next = [...prev];
        next[event.index] = { ...next[event.index], status: 'failed', error: event.error };
        if (event.index + 1 < next.length) next[event.index + 1].status = 'sending';
        return next;
      });
      setStats(s => ({ ...s, failed: s.failed + 1 }));
    } else if (event.event === 'send_complete') {
      setComplete(true);
      setSending(false);
    }
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
