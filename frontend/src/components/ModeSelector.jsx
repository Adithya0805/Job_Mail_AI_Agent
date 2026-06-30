import React, { useState } from 'react';
import useProfileStore from '../store/useProfileStore';

// ModeSelector component to select the tone of the generated email
const ModeSelector = () => {
  const selectedMode = useProfileStore((state) => state.selected_mode);
  const setSelectedMode = useProfileStore((state) => state.setSelectedMode);

  const modes = [
    {
      id: 'simple',
      title: 'Simple',
      description: 'Short & direct. Best for startups.',
    },
    {
      id: 'professional',
      title: 'Professional',
      description: 'Formal & structured. Best for MNCs.',
    },
    {
      id: 'advanced',
      title: 'Advanced',
      description: 'Deep tailored. Best for senior/niche roles.',
    },
  ];

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl text-slate-100 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Select Mode</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`cursor-pointer rounded-xl p-4 border transition-all duration-200 ${
              selectedMode === mode.id
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'border-slate-850 bg-slate-950/40 hover:border-indigo-500/30 hover:bg-slate-950'
            }`}
          >
            <h3 className={`font-bold mb-1 ${selectedMode === mode.id ? 'text-indigo-400' : 'text-slate-350'}`}>
              {mode.title}
            </h3>
            <p className="text-xs text-slate-500">{mode.description}</p>
          </div>
        ))}
      </div>
      {!selectedMode && (
        <p className="text-red-400 text-xs mt-2">Please select a mode.</p>
      )}
    </div>
  );
};

export default ModeSelector;
