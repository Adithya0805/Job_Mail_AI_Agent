import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function useBulkGenerate() {
  const [generating, setGenerating] = useState(false);
  const [complete, setComplete] = useState(false);
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ generated: 0, failed: 0 });
  
  const abortControllerRef = useRef(null);

  const startGeneration = async (jobs, profile, mode_override) => {
    setGenerating(true);
    setComplete(false);
    setTotal(jobs.length);
    setCurrentIndex(0);
    setStats({ generated: 0, failed: 0 });

    const initialResults = jobs.map((job, idx) => ({
      index: idx,
      company: job.company_name,
      role: job.role,
      status: idx === 0 ? 'generating' : 'pending',
      email_data: null,
      error: null
    }));
    setResults(initialResults);

    abortControllerRef.current = new AbortController();

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(`${BASE_URL}/api/bulk/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ jobs, profile, mode_override }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) throw new Error("Failed to start generation");

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
        console.error("Generation stream error:", err);
        setResults(prev => prev.map(r =>
          r.status === 'pending' || r.status === 'generating'
            ? { ...r, status: 'failed', error: 'Stream interrupted' }
            : r
        ));
        setComplete(true);
        setGenerating(false);
      }
    }
  };

  const handleEvent = (event) => {
    if (event.event === 'progress') {
      setCurrentIndex(event.index + 1);
      setResults(prev => {
        const next = [...prev];
        next[event.index] = { ...next[event.index], status: 'generated', email_data: event.email_data };
        if (event.index + 1 < next.length && next[event.index + 1].status === 'pending') {
          next[event.index + 1].status = 'generating';
        }
        return next;
      });
      setStats(s => ({ ...s, generated: s.generated + 1 }));
    } else if (event.event === 'error') {
      setCurrentIndex(event.index + 1);
      setResults(prev => {
        const next = [...prev];
        next[event.index] = { ...next[event.index], status: 'failed', error: event.error };
        if (event.index + 1 < next.length && next[event.index + 1].status === 'pending') {
          next[event.index + 1].status = 'generating';
        }
        return next;
      });
      setStats(s => ({ ...s, failed: s.failed + 1 }));
    } else if (event.event === 'complete') {
      setComplete(true);
      setGenerating(false);
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    setComplete(true);
    setGenerating(false);
  };

  const reset = () => {
    setGenerating(false);
    setComplete(false);
    setResults([]);
    setCurrentIndex(0);
    setTotal(0);
    setStats({ generated: 0, failed: 0 });
  };

  return { startGeneration, stopGeneration, reset, setResults, generating, complete, results, currentIndex, total, stats };
}
