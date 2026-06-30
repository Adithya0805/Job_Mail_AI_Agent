import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header / Top Navigation */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <span className="font-extrabold text-base tracking-tighter">JM</span>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            Job Mail AI
          </span>
        </div>
        <button
          onClick={() => navigate('/generator')}
          className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-semibold transition-all hover:scale-105 active:scale-95"
        >
          Enter Workspace
        </button>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto text-center py-12 md:py-24 z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 animate-pulse">
          🚀 Open Platform — No Sign Up Required
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white via-slate-100 to-indigo-200">
          Land Job Interviews with <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Hyper-Realistic</span> Cold Emails
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-light leading-relaxed">
          An open-access generator fueled by your custom <strong>AI Specific Memory</strong> context. Create highly professional, tailored cover letters and cold emails that wow recruiters.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full">
          <button
            onClick={() => navigate('/generator')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-base font-bold shadow-xl shadow-indigo-600/30 hover:shadow-indigo-500/40 transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-2"
          >
            Create Cold Email
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-base font-bold transition-all hover:scale-[1.03] active:scale-95"
          >
            View Tracker Dashboard
          </button>
        </div>

        {/* Features Grid */}
        <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          {/* Card 1 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
              💡
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Specific Memory</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Feed custom, vital directions or style context (e.g. key projects, preferred tones, specific graduation parameters) directly into the generator's memory bank.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
              📋
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2-Second Copy-Paste Flow</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              No complex email syncing or OAuth consent limits. Review elegant cover letters generated on-the-fly, make edits, and copy them in a click.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group hover:translate-y-[-4px]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl font-bold mb-5 group-hover:scale-110 transition-transform">
              📊
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Persistent Application Log</h3>
            <p className="text-slate-400 text-sm leading-relaxed font-light">
              Logs all copied emails into an interactive tracking dashboard dynamically. Track responses, interview scheduling, and job application statistics.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 bg-black/20 py-8 text-center text-xs text-slate-500 z-10 mt-12">
        <p>© 2026 Job Mail AI. Built for highly professional job applications.</p>
      </footer>
    </div>
  );
}
