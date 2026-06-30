/*
  File Purpose: Main Landing Page for Job Mail AI (Dark Mode, Premium Conversion-Optimized Copy)
  
  HEADLINE VARIANTS:
  1. "Job emails that sound like you actually read the JD — because the AI did, with your real skills attached."
     -> [RECOMMENDED] Focuses directly on the core positioning: personalization, real skills, and authenticity over generic AI.
  2. "Recruiters spot generic AI in 2 seconds. Write emails that showcase your real projects."
     -> Hits the fear of being filtered out, but slightly less focused on the tool's core mechanism.
  3. "Stop re-explaining your background to ChatGPT. Personalize 25 job emails in one click."
     -> Strong focus on the convenience/Zustand storage advantage, but less outcome-focused than variant 1.
*/

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import BeforeAfterDemo from '../components/BeforeAfterDemo';
import LiveCounter from '../components/LiveCounter';

// Lazy load the comparison table for performance below the fold
const DifferentiatorTable = React.lazy(() => import('../components/DifferentiatorTable'));

export default function Landing() {
  const navigate = useNavigate();
  const [showTable, setShowTable] = useState(false);
  const tableRef = useRef(null);

  // Lazy load table on scroll using Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShowTable(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Load slightly before it enters the viewport
    );
    if (tableRef.current) {
      observer.observe(tableRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const scrollToDemo = (e) => {
    e.preventDefault();
    document.getElementById('problem-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* SECTION 1 — Hero */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <span className="font-extrabold text-sm tracking-tighter">JM</span>
          </div>
          <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            Job Mail AI
          </span>
        </div>
        <button
          onClick={() => navigate('/generator')}
          className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold transition-all hover:scale-105 active:scale-95"
        >
          Enter Workspace
        </button>
      </header>

      <main className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-6 py-12 md:py-20 z-10">
        {/* Hero Content */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
          {/* Live Counter component positioned at the very top of hero */}
          <div className="mb-6 h-9">
            <LiveCounter />
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300">
            Job emails that sound like you actually read the JD — because the AI did, with your real skills attached.
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-400 font-light max-w-2xl leading-relaxed">
            No signup. Paste a job description, tell us what to highlight, get a tailored email in 20 seconds.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3.5 w-full">
            <button
              onClick={() => navigate('/generator')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
            >
              Generate your first email free
            </button>
            <a
              href="#problem-section"
              onClick={scrollToDemo}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold tracking-wide transition-colors"
            >
              See how it works ↓
            </a>
          </div>
        </div>

        {/* Hero Visual Area: Before/After Comparison */}
        <div className="w-full max-w-4xl mx-auto mb-20">
          <BeforeAfterDemo />
        </div>

        {/* SECTION 2 — The Problem */}
        <section id="problem-section" className="border-t border-slate-900 py-16 text-center max-w-2xl mx-auto">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">The Pain</h2>
          <p className="text-lg text-slate-300 font-light leading-relaxed">
            Customizing emails for 30 applications takes hours. Generic AI output sounds robotic. Job Mail AI solves this by injecting your real skill highlights and custom instructions directly into the job description structure.
          </p>
        </section>

        {/* SECTION 3 — How It Works */}
        <section className="border-t border-slate-900 py-20">
          <h2 className="text-center text-xs font-bold text-indigo-400 uppercase tracking-widest mb-12">Visual Stepper</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">1. Tell us once</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Add your skills, projects, and what matters about your background (the AI Specific Memory field).
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">2. Paste any job</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Drop in the JD and HR email.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">3. Pick your tone</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simple, Professional, or Advanced.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-900/20 border border-slate-900 rounded-xl p-5 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center mb-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-white mb-2">4. Copy and send</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Get a tailored email in seconds, logged automatically to your tracker.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4 — The Differentiator */}
        <section ref={tableRef} className="border-t border-slate-900 py-20 max-w-4xl mx-auto w-full">
          <h2 className="text-center text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Comparison</h2>
          <h3 className="text-center text-xl sm:text-2xl font-extrabold text-white mb-10">Why this isn't just another AI writer</h3>
          
          <div className="min-h-[220px]">
            {showTable ? (
              <Suspense fallback={<div className="h-48 flex items-center justify-center text-xs text-slate-500">Loading comparison details...</div>}>
                <DifferentiatorTable />
              </Suspense>
            ) : (
              <div className="h-48 flex items-center justify-center text-xs text-slate-500">Scroll to view comparison</div>
            )}
          </div>
        </section>

        {/* SECTION 5 — Social Proof / Trust signals */}
        <section className="border-t border-slate-900 py-20 max-w-3xl mx-auto w-full">
          <h2 className="text-center text-xs font-bold text-indigo-400 uppercase tracking-widest mb-10">Trust</h2>
          <div className="bg-slate-900/20 border border-slate-900 rounded-2xl p-6 md:p-8 backdrop-blur-sm">
            <h4 className="text-sm font-bold text-white mb-2">Founder's Note</h4>
            <blockquote className="text-slate-400 text-sm leading-relaxed italic font-light mb-4">
              "I got tired of copying and pasting the same cover letter, or re-explaining my resume to ChatGPT 50 times a day. So I built this. No accounts, no data-mining, just highly personalized cold emails that showcase your actual skill proof."
            </blockquote>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t border-slate-800 text-xs text-slate-500">
              <span>— Adithya Kuppusamy, Creator</span>
              <span className="font-semibold text-indigo-400/80">No account required — try it before you trust it.</span>
            </div>
          </div>
        </section>

        {/* SECTION 6 — Final CTA */}
        <section className="border-t border-slate-900 py-20 text-center max-w-xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            Your next application deserves more than a template
          </h3>
          <p className="text-slate-500 text-xs mb-8">Takes 20 seconds. No signup.</p>
          <button
            onClick={() => navigate('/generator')}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            Generate your first email free
          </button>
        </section>
      </main>

      {/* SECTION 7 — Footer */}
      <footer className="w-full border-t border-slate-900 py-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Job Mail AI</span>
            <span>·</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-4">
            <a 
              href="https://github.com/Adithya0805/Job_Mail_AI_Agent" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-indigo-400 transition-colors"
            >
              GitHub
            </a>
            <span>·</span>
            <a 
              href="https://www.linkedin.com/in/adithya-kuppusamy" 
              target="_blank" 
              rel="noreferrer" 
              className="hover:text-indigo-400 transition-colors"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
