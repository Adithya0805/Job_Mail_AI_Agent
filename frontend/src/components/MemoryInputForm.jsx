import React from 'react';
import useProfileStore from '../store/useProfileStore';

// MemoryInputForm component to collect custom LLM memory rules and guidelines
const MemoryInputForm = () => {
  const specificMemory = useProfileStore((state) => state.profile.specific_memory || '');
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const handleChange = (e) => {
    updateProfile({ specific_memory: e.target.value });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🧠</span>
        <h2 className="text-xl font-semibold text-gray-800">AI Specific Memory / Instructions</h2>
      </div>
      <p className="text-xs text-gray-500 mb-4 leading-relaxed">
        Provide custom guidelines to anchor the generation (e.g., specific projects to highlight, custom tone preferences, CSE B.Tech status, or strict formatting rules). The AI will prioritize these directions.
      </p>
      
      <div className="space-y-4">
        <div>
          <textarea
            name="specific_memory"
            value={specificMemory}
            onChange={handleChange}
            rows="4"
            className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
            placeholder="Examples:
- Always highlight my LangChain experience and 9.2 CGPA.
- Use an enthusiastic, conversational tone rather than too formal.
- Mention my recent React project and fit in bullet points."
          ></textarea>
          <div className="flex justify-between items-center mt-1 text-xs text-gray-400">
            <span>The AI will heavily align with this context</span>
            <span>{specificMemory.length} chars</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryInputForm;
