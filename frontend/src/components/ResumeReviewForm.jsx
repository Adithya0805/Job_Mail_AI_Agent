// Component for reviewing and editing parsed profile details before confirming in dark-mode glassmorphic style
import React, { useState, useEffect } from 'react';
import useProfileStore from '../store/useProfileStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function ResumeReviewForm({ parsedData, onSaveSuccess, onCancel }) {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  // local state initialized from parsed data or current profile values
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    degree: '',
    institution: '',
    graduation_year: '',
    cgpa: '',
    experience_level: '',
    skills_languages: [],
    skills_frameworks: [],
    skills_ai_ml: [],
    projects: [],
    certifications: [],
    summary: '',
    specific_memory: profile.specific_memory || ''
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showUnmapped, setShowUnmapped] = useState(false);

  useEffect(() => {
    if (parsedData?.profile) {
      const p = parsedData.profile;
      setFormData({
        full_name: p.full_name || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        linkedin_url: p.linkedin || p.linkedin_url || '',
        github_url: p.github || p.github_url || '',
        portfolio_url: p.portfolio || p.portfolio_url || '',
        degree: p.degree || '',
        institution: p.institution || '',
        graduation_year: p.graduation_year || '',
        cgpa: p.cgpa || '',
        experience_level: p.experience_level || '',
        skills_languages: p.skills?.languages || p.skills_languages || [],
        skills_frameworks: p.skills?.frameworks || p.skills_frameworks || [],
        skills_ai_ml: p.skills?.ai_ml || p.skills_ai_ml || [],
        projects: (p.projects || []).map(proj => ({
          name: proj.name || '',
          description: proj.description || '',
          tech_stack: Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : (proj.tech_stack || ''),
          live_url: proj.live_url || ''
        })),
        certifications: p.certifications || [],
        summary: p.summary || '',
        specific_memory: profile.specific_memory || ''
      });
    } else {
      // Use current store values if no parsedData is passed
      setFormData({
        ...profile,
        graduation_year: profile.graduation_year || '',
        cgpa: profile.cgpa || '',
        skills_languages: profile.skills_languages || [],
        skills_frameworks: profile.skills_frameworks || [],
        skills_ai_ml: profile.skills_ai_ml || [],
        projects: profile.projects || [],
        certifications: profile.certifications || []
      });
    }
  }, [parsedData, profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      [field]: value.split(',').map(s => s.trim()).filter(s => s)
    }));
  };

  // Projects handling
  const addProject = () => {
    setFormData(prev => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', tech_stack: '', live_url: '' }]
    }));
  };

  const updateProject = (index, field, value) => {
    setFormData(prev => {
      const updated = [...prev.projects];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, projects: updated };
    });
  };

  const removeProject = (index) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    }));
  };

  // Certifications handling
  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, '']
    }));
  };

  const updateCertification = (index, value) => {
    setFormData(prev => {
      const updated = [...prev.certifications];
      updated[index] = value;
      return { ...prev, certifications: updated };
    });
  };

  const removeCertification = (index) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Basic UI Validation
    if (!formData.full_name.trim()) {
      setError("Full Name is required.");
      setSaving(false);
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required.");
      setSaving(false);
      return;
    }

    try {
      const uuid = localStorage.getItem('client_uuid');
      if (!uuid) throw new Error("Client session ID missing");

      // Format payloads to be strictly typesafe
      const payload = {
        ...formData,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null
      };

      // Call backend API to persist profile details
      const res = await fetch(`${BASE_URL}/api/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-ID': uuid
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save profile on backend database.');
      }

      // Update local Zustand store
      updateProfile(formData);
      setSaving(false);
      if (onSaveSuccess) onSaveSuccess();

    } catch (err) {
      setError(err.message || 'Error occurred while saving profile.');
      setSaving(false);
    }
  };

  // Render Banner depending on parsing confidence levels
  const confidence = parsedData?.confidence || null;

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl text-slate-100">
      
      {/* BANNERS */}
      {confidence === 'high' && (
        <div className="bg-green-500/10 text-green-400 border border-green-500/20 rounded-xl p-4 mb-6 flex gap-3 text-sm items-start">
          <span className="text-base">✓</span>
          <div>
            <p className="font-bold">We found most of your details!</p>
            <p className="text-xs text-slate-400 mt-0.5">Please review the parsed experience, skills, and projects before saving.</p>
          </div>
        </div>
      )}
      {confidence === 'medium' && (
        <div className="bg-amber-500/10 text-amber-300 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3 text-sm items-start">
          <span className="text-base">⚠</span>
          <div>
            <p className="font-bold">We filled in what we found.</p>
            <p className="text-xs text-slate-400 mt-0.5">Some fields could not be matched. Please fill them in manually below.</p>
          </div>
        </div>
      )}
      {confidence === 'low' && (
        <div className="bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-xl p-4 mb-6 flex gap-3 text-sm items-start">
          <span className="text-base">⚠</span>
          <div>
            <p className="font-bold">We could only extract limited details.</p>
            <p className="text-xs text-slate-400 mt-0.5">We strongly recommend filling out the missing credentials below to optimize generation.</p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Review & Edit Profile</h2>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-3 mb-6 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleConfirmSave} className="space-y-6">
        
        {/* Personal Details */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Full Name *</label>
              <input 
                type="text" 
                name="full_name" 
                value={formData.full_name} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email *</label>
              <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Phone</label>
              <input 
                type="text" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Location</label>
              <input 
                type="text" 
                name="location" 
                value={formData.location} 
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">LinkedIn URL</label>
              <input 
                type="text" 
                name="linkedin_url" 
                value={formData.linkedin_url} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">GitHub URL</label>
              <input 
                type="text" 
                name="github_url" 
                value={formData.github_url} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Portfolio URL</label>
              <input 
                type="text" 
                name="portfolio_url" 
                value={formData.portfolio_url} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Education & Experience */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
            Education & Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Degree</label>
              <input 
                type="text" 
                name="degree" 
                value={formData.degree} 
                onChange={handleChange}
                placeholder="e.g. B.Tech Computer Science"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Institution</label>
              <input 
                type="text" 
                name="institution" 
                value={formData.institution} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Graduation Year</label>
              <input 
                type="number" 
                name="graduation_year" 
                value={formData.graduation_year} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">CGPA / GPA</label>
              <input 
                type="number" 
                step="0.01"
                name="cgpa" 
                value={formData.cgpa} 
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Experience Level</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Select Level</option>
                <option value="fresher">Fresher (0-1 yrs)</option>
                <option value="junior">Junior (1-3 yrs)</option>
                <option value="mid">Mid (3-5+ yrs)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
            Skills (Comma separated)
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Programming Languages</label>
              <input 
                type="text" 
                value={formData.skills_languages.join(', ')} 
                onChange={(e) => handleArrayChange(e, 'skills_languages')}
                placeholder="Python, JavaScript, Go"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Frameworks & Libraries</label>
              <input 
                type="text" 
                value={formData.skills_frameworks.join(', ')} 
                onChange={(e) => handleArrayChange(e, 'skills_frameworks')}
                placeholder="React, Next.js, Django, FastAPI"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">AI / ML Toolkits</label>
              <input 
                type="text" 
                value={formData.skills_ai_ml.join(', ')} 
                onChange={(e) => handleArrayChange(e, 'skills_ai_ml')}
                placeholder="LangChain, PyTorch, Ollama, OpenAI"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Projects</h3>
            <button 
              type="button" 
              onClick={addProject}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Add Project
            </button>
          </div>
          <div className="space-y-4">
            {formData.projects.map((proj, idx) => (
              <div key={idx} className="bg-slate-950 border border-slate-850 rounded-xl p-4 relative">
                <button 
                  type="button" 
                  onClick={() => removeProject(idx)}
                  className="absolute top-3 right-3 text-red-500 hover:text-red-400 text-xs font-semibold"
                >
                  Remove
                </button>
                <div className="space-y-3 mt-4">
                  <div>
                    <input 
                      type="text" 
                      placeholder="Project Name" 
                      value={proj.name} 
                      onChange={(e) => updateProject(idx, 'name', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Project Description" 
                      value={proj.description} 
                      onChange={(e) => updateProject(idx, 'description', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white" 
                      rows="2"
                    ></textarea>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Tech Stack (e.g. React, Node.js)" 
                      value={proj.tech_stack} 
                      onChange={(e) => updateProject(idx, 'tech_stack', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                    <input 
                      type="text" 
                      placeholder="Live / GitHub Link" 
                      value={proj.live_url} 
                      onChange={(e) => updateProject(idx, 'live_url', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
            <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Certifications</h3>
            <button 
              type="button" 
              onClick={addCertification}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
            >
              + Add Certification
            </button>
          </div>
          <div className="space-y-2">
            {formData.certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Certification Name" 
                  value={cert} 
                  onChange={(e) => updateCertification(idx, e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white"
                />
                <button 
                  type="button" 
                  onClick={() => removeCertification(idx)}
                  className="text-red-500 hover:text-red-400 px-2 text-xs font-bold"
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Personal Summary */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-800 pb-1.5">
            Personal Summary
          </h3>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="3"
            placeholder="2-3 line professional bio summarizing your background..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          ></textarea>
        </section>

        {/* COLLAPSIBLE UNMAPPED TEXT */}
        {parsedData?.unmapped_text && (
          <section className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <button
              type="button"
              onClick={() => setShowUnmapped(!showUnmapped)}
              className="w-full flex justify-between items-center p-4 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <span>We found additional content we couldn't categorize</span>
              <span>{showUnmapped ? '▲ Hide' : '▼ View'}</span>
            </button>
            {showUnmapped && (
              <div className="p-4 border-t border-slate-850 bg-slate-950 text-xs text-slate-400 leading-relaxed max-h-40 overflow-y-auto font-mono whitespace-pre-wrap">
                {parsedData.unmapped_text}
                <p className="mt-4 text-[10px] text-indigo-400/80 font-sans italic font-semibold">
                  You can manually add relevant details to the sections above if needed.
                </p>
              </div>
            )}
          </section>
        )}

        <div className="pt-6 border-t border-slate-800 flex justify-end gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
          >
            {saving ? 'Saving...' : 'Confirm and save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
