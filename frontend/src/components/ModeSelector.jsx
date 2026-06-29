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
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Select Mode</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode) => (
          <div
            key={mode.id}
            onClick={() => setSelectedMode(mode.id)}
            className={`cursor-pointer rounded-lg p-4 border-2 transition-all duration-200 ${
              selectedMode === mode.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
            }`}
          >
            <h3 className={`font-semibold mb-1 ${selectedMode === mode.id ? 'text-blue-700' : 'text-gray-700'}`}>
              {mode.title}
            </h3>
            <p className="text-sm text-gray-600">{mode.description}</p>
          </div>
        ))}
      </div>
      {!selectedMode && (
        <p className="text-red-500 text-sm mt-2">Please select a mode.</p>
      )}
    </div>
  );
};

export default ModeSelector;
