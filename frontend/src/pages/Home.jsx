// Main Workspace component coordinating profile checking, resume uploads, and email generation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResumeUpload from '../components/ResumeUpload';
import ResumeReviewForm from '../components/ResumeReviewForm';
import JobInputForm from '../components/JobInputForm';
import MemoryInputForm from '../components/MemoryInputForm';
import ModeSelector from '../components/ModeSelector';
import EmailPreview from '../components/EmailPreview';
import useProfileStore from '../store/useProfileStore';
import { useApplications } from '../hooks/useApplications';
import { generateEmail } from '../services/api';
import { mergeProfiles } from '../utils/profileMerge';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const Home = () => {
  const profile = useProfileStore((state) => state.profile);
  const updateProfile = useProfileStore((state) => state.updateProfile);
  const jobInput = useProfileStore((state) => state.job_input);
  const selectedMode = useProfileStore((state) => state.selected_mode);
  const buildPayload = useProfileStore((state) => state.buildPayload);

  // Flow states: loading, upload, review, workspace
  const [flowState, setFlowState] = useState('loading');
  const [parsedData, setParsedData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [error, setError] = useState('');
  
  const { stats } = useApplications();
  const navigate = useNavigate();

  // Check if profile exists on mount
  useEffect(() => {
    // 1. Check Zustand store first
    if (profile.full_name && profile.email) {
      setFlowState('workspace');
      return;
    }

    // 2. Fallback to querying database via Client UUID
    const loadRemoteProfile = async () => {
      try {
        const uuid = localStorage.getItem('client_uuid');
        if (!uuid) {
          setFlowState('upload');
          return;
        }
        const res = await fetch(`${BASE_URL}/api/profile`, {
          headers: { 'X-User-ID': uuid }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.full_name && data.email) {
            updateProfile(data);
            setFlowState('workspace');
            return;
          }
        }
      } catch (err) {
        console.error("Error loading remote profile:", err);
      }
      setFlowState('upload');
    };

    loadRemoteProfile();
  }, [profile.full_name, profile.email, updateProfile]);

  const handleParsed = (parsedResponse) => {
    if (isUpdating) {
      // Merge new resume data with existing profile details
      const merged = mergeProfiles(profile, parsedResponse.profile);
      setParsedData({
        ...parsedResponse,
        profile: merged
      });
    } else {
      setParsedData(parsedResponse);
    }
    setFlowState('review');
  };

  const handleManualEntry = () => {
    setParsedData(null);
    setFlowState('review');
  };

  const handleSaveSuccess = () => {
    setFlowState('workspace');
    setIsUpdating(false);
    setParsedData(null);
  };

  const handleCancelReview = () => {
    if (isUpdating || (profile.full_name && profile.email)) {
      setFlowState('workspace');
    } else {
      setFlowState('upload');
    }
    setIsUpdating(false);
    setParsedData(null);
  };

  const handleTriggerUpdate = () => {
    setIsUpdating(true);
    setFlowState('upload');
  };

  // Simple validation for Generate button
  const isGenerateEnabled = 
    jobInput.hr_email && 
    jobInput.job_description.length >= 100 && 
    selectedMode;

  const handleGenerate = async () => {
    if (!isGenerateEnabled) return;
    
    setError('');
    setIsLoading(true);
    
    try {
      const payload = buildPayload();
      const responseData = await generateEmail(payload);
      setEmailData(responseData);
    } catch (err) {
      console.error('Error generating email:', err);
      setError(err.message || 'An unexpected error occurred while generating the email.');
    } finally {
      setIsLoading(false);
    }
  };

  // RENDER LOADING STATE
  if (flowState === 'loading') {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center min-h-[calc(100vh-64px)]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  // RENDER RESUME UPLOAD PATHWAY
  if (flowState === 'upload') {
    return (
      <div className="flex-1 bg-slate-950 flex items-center justify-center p-6 min-h-[calc(100vh-64px)]">
        <ResumeUpload 
          onParsed={handleParsed} 
          onManual={handleManualEntry} 
        />
      </div>
    );
  }

  // RENDER REVIEW & EDIT FORM PATHWAY
  if (flowState === 'review') {
    return (
      <div className="flex-1 bg-slate-950 p-6 flex items-center justify-center min-h-[calc(100vh-64px)] overflow-y-auto">
        <div className="w-full max-w-2xl py-6">
          <ResumeReviewForm 
            parsedData={parsedData} 
            onSaveSuccess={handleSaveSuccess} 
            onCancel={handleCancelReview}
          />
        </div>
      </div>
    );
  }

  // RENDER NORMAL WORKSPACE PATHWAY (profile exists)
  return (
    <div className="flex-1 bg-slate-950 flex flex-col font-sans text-slate-100 min-h-[calc(100vh-64px)]">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Top Forms Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Panel - Profile Card summary */}
          <div className="w-full md:w-2/5">
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-bold text-white">Your Profile</h2>
                <button 
                  onClick={() => setFlowState('review')} 
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  Edit Profile
                </button>
              </div>

              <div className="space-y-4 text-sm text-slate-350">
                <div>
                  <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Candidate</div>
                  <div className="text-white font-bold text-base">{profile.full_name}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{profile.email}</div>
                  {profile.phone && <div className="text-slate-400 text-xs">{profile.phone}</div>}
                  {profile.location && <div className="text-slate-400 text-xs">{profile.location}</div>}
                </div>

                {(profile.degree || profile.institution) && (
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Education</div>
                    <div className="text-slate-200 font-medium">{profile.degree || 'Degree'}</div>
                    <div className="text-slate-400 text-xs">{profile.institution || 'Institution'}</div>
                    {(profile.graduation_year || profile.cgpa) && (
                      <div className="text-slate-400 text-xs mt-0.5">
                        {profile.graduation_year && `Class of ${profile.graduation_year}`}
                        {profile.cgpa && ` · CGPA: ${profile.cgpa}`}
                      </div>
                    )}
                  </div>
                )}

                {profile.experience_level && (
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Experience Level</div>
                    <div className="text-slate-200 capitalize font-medium">{profile.experience_level}</div>
                  </div>
                )}

                {((profile.skills_languages || []).length > 0 || 
                  (profile.skills_frameworks || []).length > 0 || 
                  (profile.skills_ai_ml || []).length > 0) && (
                  <div>
                    <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Skills Highlight</div>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {[
                        ...(profile.skills_languages || []), 
                        ...(profile.skills_frameworks || []), 
                        ...(profile.skills_ai_ml || [])
                      ].slice(0, 8).map((skill, index) => (
                        <span key={index} className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-semibold">
                          {skill}
                        </span>
                      ))}
                      {[
                        ...(profile.skills_languages || []), 
                        ...(profile.skills_frameworks || []), 
                        ...(profile.skills_ai_ml || [])
                      ].length > 8 && (
                        <span className="text-[10px] text-slate-500 font-medium self-center pl-1">
                          +{[
                            ...(profile.skills_languages || []), 
                            ...(profile.skills_frameworks || []), 
                            ...(profile.skills_ai_ml || [])
                          ].length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-855">
                  <button 
                    onClick={handleTriggerUpdate}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                    Update from new resume
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Job Details, Memory, & Mode */}
          <div className="w-full md:w-3/5 flex flex-col gap-6">
            <JobInputForm />
            <MemoryInputForm />
            <ModeSelector />
          </div>
        </div>

        {/* Generated Email Section */}
        {(emailData || isLoading) && (
          <div className="w-full" id="preview-section">
            <EmailPreview 
              emailData={emailData} 
              isLoading={isLoading} 
              onRegenerate={handleGenerate} 
            />
          </div>
        )}
      </main>

      {/* Bottom Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.2)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            {error && (
              <p className="text-red-400 font-medium px-4 py-2 bg-red-500/10 border border-red-500/20 rounded inline-block text-sm">
                ⚠️ {error}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            <button
              onClick={() => {
                handleGenerate().then(() => {
                  setTimeout(() => {
                    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                });
              }}
              disabled={!isGenerateEnabled || isLoading}
              className={`px-8 py-3 rounded-lg font-bold text-lg transition-all flex items-center gap-2 ${
                isGenerateEnabled && !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md transform hover:-translate-y-0.5' 
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </>
              ) : (
                'Generate Email →'
              )}
            </button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="text-xs text-slate-500 hover:text-indigo-400 font-medium mr-1 transition-colors"
            >
              {stats.sent} applications tracked
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
