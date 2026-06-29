import React, { useState } from 'react';

const BulkReviewPanel = ({ generatedResults, onSend, onBack }) => {
  // Extract only successful generated jobs for review
  const initialData = generatedResults
    .filter(r => r.status === 'generated')
    .map(r => ({ ...r, checked: true, expanded: false }));

  const [reviewList, setReviewList] = useState(initialData);

  const checkedCount = reviewList.filter(item => item.checked).length;
  const total = reviewList.length;

  const toggleCheck = (index) => {
    setReviewList(prev => prev.map((item, i) => i === index ? { ...item, checked: !item.checked } : item));
  };

  const toggleExpand = (index) => {
    setReviewList(prev => prev.map((item, i) => i === index ? { ...item, expanded: !item.expanded } : item));
  };

  const updateField = (index, field, value) => {
    setReviewList(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          email_data: {
            ...item.email_data,
            [field]: value
          }
        };
      }
      return item;
    }));
  };

  const handleSendAll = () => {
    if (checkedCount === 0) return;
    if (window.confirm(`You are about to send ${checkedCount} emails from your Gmail.\nThis cannot be undone. Continue?`)) {
      const selectedToSend = reviewList.filter(i => i.checked).map(i => ({
        to: i.email_data.to || i.hr_email, // Need to ensure to/hr_email is available. Passed in via state normally.
        ...i.email_data,
        company_name: i.company,
        role: i.role
      }));
      onSend(selectedToSend);
    }
  };

  const modeColors = {
    simple: 'bg-gray-100 text-gray-800 border-gray-200',
    professional: 'bg-blue-100 text-blue-800 border-blue-200',
    advanced: 'bg-purple-100 text-purple-800 border-purple-200'
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800">Review {total} emails before sending</h2>
        <p className="text-sm text-gray-500 mt-1">You can edit each email. Uncheck any to skip.</p>
      </div>

      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 pb-4">
        {reviewList.map((item, idx) => (
          <div key={item.index} className={`bg-white border rounded-lg shadow-sm overflow-hidden transition-all ${!item.checked ? 'opacity-60 border-gray-200' : 'border-blue-200 ring-1 ring-blue-50'}`}>
            
            {/* Header Row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={item.checked} 
                  onChange={() => toggleCheck(idx)}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
                <div>
                  <h3 className="font-bold text-gray-800">{item.company} <span className="text-gray-400 font-normal ml-1">· {item.role}</span></h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold border ${modeColors[item.email_data.mode_used] || modeColors.simple}`}>
                  {item.email_data.mode_used}
                </span>
                <span className="text-sm text-gray-500">{item.email_data.word_count} words</span>
                <button 
                  onClick={() => toggleExpand(idx)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  {item.expanded ? '▲ Close' : '▼ Preview'}
                </button>
              </div>
            </div>

            {/* Expanded Content */}
            {item.expanded && (
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Subject</label>
                  <input 
                    type="text" 
                    value={item.email_data.subject}
                    onChange={(e) => updateField(idx, 'subject', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Body</label>
                  <textarea 
                    value={item.email_data.body}
                    onChange={(e) => updateField(idx, 'body', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 min-h-[150px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Sign-off</label>
                  <input 
                    type="text" 
                    value={item.email_data.sign_off}
                    onChange={(e) => updateField(idx, 'sign_off', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 italic"
                  />
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Matched Skills:</span>
                  <div className="flex flex-wrap gap-1">
                    {item.email_data.matched_skills?.map((s, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded border border-gray-200">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="bg-white p-4 rounded-lg shadow-[0_-4px_10px_rgba(0,0,0,0.05)] border border-gray-200 flex justify-between items-center sticky bottom-4 z-10">
        <div className="font-medium text-gray-700">
          {checkedCount} of {total} emails selected
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onBack}
            className="px-6 py-2 rounded font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            ← Back
          </button>
          <button 
            onClick={handleSendAll}
            disabled={checkedCount === 0}
            className={`px-8 py-2 rounded font-bold transition-all ${
              checkedCount > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            Send {checkedCount} Emails
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkReviewPanel;
