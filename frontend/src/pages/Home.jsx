import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';
import JobInputForm from '../components/JobInputForm';
import ModeSelector from '../components/ModeSelector';
import EmailPreview from '../components/EmailPreview';
import useProfileStore from '../store/useProfileStore';
import { useApplications } from '../hooks/useApplications';
import { generateEmail } from '../services/api';

// Home page combining the forms, generate button, and email preview
const Home = () => {
  const jobInput = useProfileStore((state) => state.job_input);
  const selectedMode = useProfileStore((state) => state.selected_mode);
  const buildPayload = useProfileStore((state) => state.buildPayload);

  const [isLoading, setIsLoading] = useState(false);
  const [emailData, setEmailData] = useState(null);
  const [error, setError] = useState('');
  
  const { stats } = useApplications();
  const navigate = useNavigate();

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

  return (
    <div className="flex-1 bg-gray-50 flex flex-col font-sans text-gray-900">
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Top Forms Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Panel - Profile Form */}
          <div className="w-full md:w-2/5">
            <ProfileForm />
          </div>

          {/* Right Panel - Job Details & Mode */}
          <div className="w-full md:w-3/5 flex flex-col">
            <JobInputForm />
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
      <footer className="bg-white border-t border-gray-200 p-4 sticky bottom-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex-1">
            {error && (
              <p className="text-red-600 font-medium px-4 py-2 bg-red-50 border border-red-200 rounded inline-block">
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
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md transform hover:-translate-y-0.5' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
              className="text-xs text-gray-500 hover:text-blue-600 font-medium mr-1 transition-colors"
            >
              {stats.sent} emails sent recently
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
