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
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Job Details</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">HR Email ID <span className="text-red-500">*</span></label>
          <input
            type="email"
            name="hr_email"
            value={jobInput.hr_email}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.hr_email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="hr@company.com"
          />
          {errors.hr_email && <p className="text-red-500 text-xs mt-1">{errors.hr_email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Job Description <span className="text-red-500">*</span></label>
          <textarea
            name="job_description"
            value={jobInput.job_description}
            onChange={handleChange}
            rows="8"
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none ${errors.job_description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Paste the complete job description here..."
          ></textarea>
          {errors.job_description && <p className="text-red-500 text-xs mt-1">{errors.job_description}</p>}
          <p className="text-xs text-gray-500 mt-1 text-right">{jobInput.job_description.length} chars (Min: 100)</p>
        </div>
      </div>
    </div>
  );
};

export default JobInputForm;
