import React, { useState, useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function LiveCounter() {
  const [total, setTotal] = useState(null);
  const [displayCount, setDisplayCount] = useState(0);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/stats/total-generated`);
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data.total === 'number') {
          setTotal(data.total);
        }
      }
    } catch (e) {
      // Fail silently: setting total to null hides the counter gracefully
      setTotal(null);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (total === null || total === 0) return;
    
    let start = displayCount;
    const end = total;
    if (start === end) return;

    const duration = 1500; // 1.5 seconds animation
    const startTime = performance.now();

    function animate(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing out quad
      const easeProgress = progress * (2 - progress);
      const currentCount = Math.floor(start + (end - start) * easeProgress);
      
      setDisplayCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }, [total]);

  // Hide gracefully if API fails or hasn't loaded a valid number
  if (total === null || total === 0) return null;

  return (
    <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-300 text-sm font-semibold shadow-inner">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
      </span>
      <span>{displayCount.toLocaleString()} applications generated overall</span>
    </div>
  );
}
