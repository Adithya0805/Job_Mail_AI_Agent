import React, { useState } from 'react';
import useProfileStore from '../store/useProfileStore';

// JobInputForm component to collect HR email and Job Description
const JobInputForm = () => {
  const jobInput = useProfileStore((state) => state.job_input);
  const updateJobInput = useProfileStore((state) => state.updateJobInput);

  const [errors, setErrors] = useState({});

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateJobInput({ [name]: value });
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl text-slate-100">
      <h2 className="text-xl font-bold mb-4 text-white">Job Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">HR Email ID <span className="text-indigo-400 font-bold">*</span></label>
          <input
            type="email"
            name="hr_email"
            value={jobInput.hr_email}
            onChange={handleChange}
            className={`w-full bg-slate-950 border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.hr_email ? 'border-red-500' : 'border-slate-800'}`}
            placeholder="hr@company.com"
          />
          {errors.hr_email && <p className="text-red-400 text-xs mt-1">{errors.hr_email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Job Description <span className="text-indigo-400 font-bold">*</span></label>
          <textarea
            name="job_description"
            value={jobInput.job_description}
            onChange={handleChange}
            rows="8"
            className={`w-full bg-slate-950 border rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 ${errors.job_description ? 'border-red-500' : 'border-slate-800'}`}
            placeholder="Paste the complete job description here..."
          ></textarea>
          {errors.job_description && <p className="text-red-400 text-xs mt-1">{errors.job_description}</p>}
          <p className="text-xs text-slate-500 mt-1 text-right">{jobInput.job_description.length} chars (Min: 100)</p>
        </div>
      </div>
    </div>
  );
};

export default JobInputForm;
