// JobDetails input panel with email domain capitalization suggestions and collapsible optional metrics
import React, { useState } from 'react';
import useProfileStore from '../store/useProfileStore';

const JobInputForm = () => {
  const jobInput = useProfileStore((state) => state.job_input);
  const updateJobInput = useProfileStore((state) => state.updateJobInput);

  const [errors, setErrors] = useState({});
  const [showOptional, setShowOptional] = useState(false);

  const validate = (name, value) => {
    let error = '';
    if (name === 'hr_email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'HR Email is required';
      else if (!emailRegex.test(value)) error = 'Invalid email format';
    }
    if (name === 'job_description') {
      if (!value) error = 'Job description is required';
      else if (value.length < 100) error = 'Job description must be at least 100 characters';
    }
    return error;
  };

  const extractCompanyFromEmail = (email) => {
    if (!email || !email.includes('@')) return '';
    const domain = email.split('@')[1];
    if (!domain) return '';
    const part = domain.split('.')[0];
    if (!part) return '';
    return part.charAt(0).toUpperCase() + part.slice(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updates = { [name]: value };

    // Auto-suggest company name if hr_email is changing and company_name is blank
    if (name === 'hr_email' && !jobInput.company_name) {
      const suggested = extractCompanyFromEmail(value);
      if (suggested) {
        updates.company_name = suggested;
      }
    }

    updateJobInput(updates);
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl text-slate-100 mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Job Details</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">HR Email ID *</label>
            <input
              type="email"
              name="hr_email"
              value={jobInput.hr_email || ''}
              onChange={handleChange}
              className={`w-full bg-slate-950 border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.hr_email ? 'border-red-500' : 'border-slate-800'}`}
              placeholder="hr@company.com"
            />
            {errors.hr_email && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.hr_email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              name="company_name"
              value={jobInput.company_name || ''}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Google"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Job Description *</label>
          <textarea
            name="job_description"
            value={jobInput.job_description || ''}
            onChange={handleChange}
            rows="6"
            className={`w-full bg-slate-950 border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.job_description ? 'border-red-500' : 'border-slate-800'}`}
            placeholder="Paste the complete job description here..."
          ></textarea>
          {errors.job_description && <p className="text-red-400 text-xs mt-1 font-semibold">{errors.job_description}</p>}
          <p className="text-xs text-slate-500 mt-1 text-right">{jobInput.job_description?.length || 0} chars (Min: 100)</p>
        </div>

        {/* Collapsible Section for extra optional fields */}
        <div className="border-t border-slate-850 pt-4">
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="flex justify-between items-center w-full text-xs font-bold text-slate-400 hover:text-white transition-colors"
          >
            <span>More details (optional)</span>
            <span>{showOptional ? '▲ Hide' : '▼ Expand'}</span>
          </button>

          {showOptional && (
            <div className="space-y-4 mt-4 animate-fadeIn">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Recipient name (optional)</label>
                <input
                  type="text"
                  name="recipient_name"
                  value={jobInput.recipient_name || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Shalini Priya Alexander"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-light italic">If you know who's reviewing applications, we'll address them directly</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Availability & Location (optional)</label>
                <input
                  type="text"
                  name="availability_window"
                  value={jobInput.availability_window || ''}
                  onChange={handleChange}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Available for interview June 2nd-15th, based in Chennai"
                />
                <p className="text-[10px] text-slate-500 mt-1 font-light italic">Mentioning availability and location shows you're ready to move fast</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1 font-mono uppercase tracking-wider">Anything else to mention? (optional)</label>
                <textarea
                  name="additional_info"
                  value={jobInput.additional_info || ''}
                  onChange={handleChange}
                  rows="3"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="e.g. Currently completing AWS certification, willing to relocate, notice period is 2 weeks"
                ></textarea>
                <p className="text-[10px] text-slate-500 mt-1 font-light italic">This is specific to THIS application — for things you always want mentioned, use AI Specific Memory in your profile instead</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobInputForm;
