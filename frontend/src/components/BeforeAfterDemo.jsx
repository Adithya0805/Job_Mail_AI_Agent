import React from 'react';

export default function BeforeAfterDemo() {
  return (
    <div className="w-full flex flex-col md:flex-row gap-6 mt-8">
      {/* LEFT CARD: Generic AI */}
      <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-semibold uppercase tracking-wider">
          Generic AI
        </div>
        <h4 className="text-sm font-semibold text-slate-400 mb-3">Vague & Templates</h4>
        <div className="font-mono text-xs text-slate-500 space-y-2 select-none">
          <p className="text-slate-400 font-bold">Subject: Application for Machine Learning Engineer Role</p>
          <p className="border-l-2 border-slate-700 pl-3 italic">
            "Dear Hiring Manager, I am writing to express my enthusiastic interest in the Machine Learning Engineer position at your company. I possess a strong background in computer science and AI techniques."
          </p>
          <p className="border-l-2 border-slate-700 pl-3 italic">
            "I have experience with Python and machine learning libraries. I am highly motivated to join your team and contribute to your goals. Thank you for your time."
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-red-400/80 font-medium">
          <span>✗</span>
          <span>Recruiters spot this template in 2 seconds.</span>
        </div>
      </div>

      {/* RIGHT CARD: Job Mail AI */}
      <div className="flex-1 bg-indigo-950/20 border border-indigo-500/30 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm shadow-[0_0_20px_rgba(99,102,241,0.05)]">
        <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-semibold uppercase tracking-wider">
          Job Mail AI
        </div>
        <h4 className="text-sm font-semibold text-indigo-300 mb-3">Hyper-Personalized</h4>
        <div className="font-mono text-xs text-slate-300 space-y-2">
          <p className="text-white font-bold">Subject: ML Engineer (Python & LangChain) — [Your Name]</p>
          <p className="border-l-2 border-indigo-500 pl-3">
            "Hi [HR Name], noticed your team is building retrieval systems with LangChain. I recently built a local PDF RAG agent utilizing LangChain to parse structured data with 94% accuracy."
          </p>
          <p className="border-l-2 border-indigo-500 pl-3">
            "I've spent the last 2 years optimizing Python pipelines, and I'd love to apply this direct experience to your core ML model requirements."
          </p>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-green-400 font-medium">
          <span>✓</span>
          <span>Tailored using your exact memory context.</span>
        </div>
      </div>
    </div>
  );
}
