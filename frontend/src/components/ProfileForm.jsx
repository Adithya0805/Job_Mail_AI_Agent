import React, { useState } from 'react';
import useProfileStore from '../store/useProfileStore';

// ProfileForm component to collect user profile details
const ProfileForm = () => {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateProfile({ [name]: value });
  };

  const handleArrayChange = (e, field) => {
    const { value } = e.target;
    updateProfile({ [field]: value.split(',').map(s => s.trim()).filter(s => s) });
  };

  // Projects handling
  const addProject = () => {
    updateProfile({ projects: [...profile.projects, { name: '', description: '', tech_stack: '', live_url: '' }] });
  };

  const updateProject = (index, field, value) => {
    const newProjects = [...profile.projects];
    newProjects[index][field] = value;
    updateProfile({ projects: newProjects });
  };

  const removeProject = (index) => {
    const newProjects = [...profile.projects];
    newProjects.splice(index, 1);
    updateProfile({ projects: newProjects });
  };

  // Certifications handling
  const addCertification = () => {
    updateProfile({ certifications: [...profile.certifications, ''] });
  };

  const updateCertification = (index, value) => {
    const newCerts = [...profile.certifications];
    newCerts[index] = value;
    updateProfile({ certifications: newCerts });
  };

  const removeCertification = (index) => {
    const newCerts = [...profile.certifications];
    newCerts.splice(index, 1);
    updateProfile({ certifications: newCerts });
  };

  // Basic Input component for reusability
  const Input = ({ label, name, type = 'text', placeholder = '' }) => (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={profile[name]}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-y-auto max-h-[calc(100vh-100px)]">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">Your Profile</h2>
      
      <div className="space-y-6">
        {/* Personal Details */}
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">Personal Details</h3>
          <div className="grid grid-cols-1 gap-3">
            <Input label="Full Name" name="full_name" />
            <Input label="Email" name="email" type="email" />
            <Input label="Phone" name="phone" />
            <Input label="Location" name="location" placeholder="e.g. New York, USA" />
            <Input label="LinkedIn URL" name="linkedin_url" />
            <Input label="GitHub URL" name="github_url" />
            <Input label="Portfolio URL" name="portfolio_url" />
          </div>
        </section>

        {/* Education & Experience */}
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">Education & Experience</h3>
          <div className="grid grid-cols-1 gap-3">
            <Input label="Degree" name="degree" placeholder="e.g. B.Tech Computer Science" />
            <Input label="Institution" name="institution" />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Graduation Year" name="graduation_year" type="number" />
              <Input label="CGPA" name="cgpa" type="number" />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
              <select
                name="experience_level"
                value={profile.experience_level}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Level</option>
                <option value="fresher">Fresher</option>
                <option value="junior">Junior (1-3 yrs)</option>
                <option value="mid">Mid (3-5+ yrs)</option>
              </select>
            </div>
          </div>
        </section>

        {/* Skills */}
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">Skills (Comma separated)</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
              <input
                type="text"
                value={profile.skills_languages.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills_languages')}
                placeholder="Python, JavaScript, C++"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Frameworks</label>
              <input
                type="text"
                value={profile.skills_frameworks.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills_frameworks')}
                placeholder="React, Django, FastAPI"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">AI / ML</label>
              <input
                type="text"
                value={profile.skills_ai_ml.join(', ')}
                onChange={(e) => handleArrayChange(e, 'skills_ai_ml')}
                placeholder="TensorFlow, PyTorch, LangChain"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Projects */}
        <section>
          <div className="flex justify-between items-center mb-3 border-b pb-1">
            <h3 className="text-lg font-medium text-gray-700">Projects</h3>
            <button type="button" onClick={addProject} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Project</button>
          </div>
          <div className="space-y-4">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-3 border border-gray-200 rounded relative bg-gray-50">
                <button type="button" onClick={() => removeProject(idx)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm">Remove</button>
                <div className="space-y-2 mt-2">
                  <input type="text" placeholder="Project Name" value={proj.name} onChange={(e) => updateProject(idx, 'name', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" />
                  <textarea placeholder="Description" value={proj.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" rows="2"></textarea>
                  <input type="text" placeholder="Tech Stack" value={proj.tech_stack} onChange={(e) => updateProject(idx, 'tech_stack', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" />
                  <input type="text" placeholder="Live URL / GitHub" value={proj.live_url} onChange={(e) => updateProject(idx, 'live_url', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm" />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Certifications */}
        <section>
          <div className="flex justify-between items-center mb-3 border-b pb-1">
            <h3 className="text-lg font-medium text-gray-700">Certifications</h3>
            <button type="button" onClick={addCertification} className="text-sm text-blue-600 hover:text-blue-800 font-medium">+ Add Cert</button>
          </div>
          <div className="space-y-2">
            {profile.certifications.map((cert, idx) => (
              <div key={idx} className="flex gap-2">
                <input type="text" placeholder="Certification Name" value={cert} onChange={(e) => updateCertification(idx, e.target.value)} className="flex-1 p-2 border border-gray-300 rounded text-sm" />
                <button type="button" onClick={() => removeCertification(idx)} className="text-red-500 hover:text-red-700 px-2">X</button>
              </div>
            ))}
          </div>
        </section>

        {/* Summary */}
        <section>
          <h3 className="text-lg font-medium text-gray-700 mb-3 border-b pb-1">Personal Summary</h3>
          <textarea
            name="summary"
            value={profile.summary}
            onChange={handleChange}
            rows="3"
            placeholder="2-3 line personal bio..."
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          ></textarea>
        </section>
      </div>
    </div>
  );
};

export default ProfileForm;
