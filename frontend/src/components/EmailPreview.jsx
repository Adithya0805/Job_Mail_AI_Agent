// Displays generated email in formatted preview or editable view, with recruiter matching strength metrics
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendEmail } from '../hooks/useSendEmail';
import useProfileStore from '../store/useProfileStore';

const EmailPreview = ({ emailData, isLoading, onRegenerate }) => {
  const [activeTab, setActiveTab] = useState('preview'); // preview, edit
  const [editableBody, setEditableBody] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const { send, sending, sent, error: sendError } = useSendEmail();
  const navigate = useNavigate();

  const jobInput = useProfileStore((state) => state.job_input);

  useEffect(() => {
    if (emailData?.body) {
      setEditableBody(emailData.body);
    }
  }, [emailData]);

  const handleCopyAndLog = async () => {
    if (!emailData) return;
    
    // Copy full email content (greeting, body, closing, signature)
    const fullText = `${emailData.greeting}\n\n${editableBody}\n\n${emailData.closing}\n\n${emailData.signature_block || ''}`;
    try {
      await navigator.clipboard.writeText(fullText);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
    }

    // Resolve company and role details
    const companyName = jobInput.company_name || 'Unknown Company';
    
    let role = 'Software Engineer';
    try {
      const firstLine = jobInput.job_description.split('\n')[0].trim().substring(0, 55);
      role = firstLine || 'Software Engineer';
    } catch {}

    // Log under user session
    try {
      await send({
        to: jobInput.hr_email,
        subject: emailData.subject,
        body: editableBody,
        sign_off: emailData.closing,
        company_name: companyName,
        role: role,
        mode_used: emailData.mode_used,
        matched_skills: emailData.matched_skills || [],
        word_count: emailData.word_count || 0
      });
    } catch (err) {
      console.error('Failed to log application:', err);
    }
  };

  // Plaintext body bullet parser
  const renderBodyHTML = (bodyText) => {
    if (!bodyText) return null;
    
    const lines = bodyText.split('\n');
    const elements = [];
    let currentList = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.substring(2));
      } else {
        if (currentList.length > 0) {
          elements.push(
            <ul key={`ul-${index}`} className="list-disc pl-5 my-4 space-y-2 text-slate-300">
              {currentList.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          );
          currentList = [];
        }
        if (trimmed) {
          elements.push(<p key={index} className="my-2 leading-relaxed text-slate-350">{trimmed}</p>);
        } else {
          elements.push(<div key={index} className="h-3"></div>);
        }
      }
    });

    if (currentList.length > 0) {
      elements.push(
        <ul key="ul-end" className="list-disc pl-5 my-4 space-y-2 text-slate-300">
          {currentList.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }

    return elements;
  };

  if (isLoading) {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm animate-pulse mt-6">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-4"></div>
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-800 rounded w-4/6"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 bg-slate-800 rounded w-32"></div>
          <div className="h-10 bg-slate-800 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!emailData) return null;

  const strength = emailData.match_strength || 'moderate';

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-xl flex flex-col gap-6 text-slate-100 mt-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white">Generated Email Draft</h3>
          <p className="text-xs text-slate-400 mt-0.5">Edit the body text or copy directly to send</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Recruiter Fit:</span>
          {strength === 'strong' ? (
            <span className="bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Strong Match
            </span>
          ) : strength === 'weak' ? (
            <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Weak Match — tailoring suggested
            </span>
          ) : (
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Moderate Match
            </span>
          )}
        </div>
      </div>

      {/* SUBJECT LINE */}
      <div className="flex items-center gap-3 bg-slate-950/60 p-3 rounded-lg border border-slate-850">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider w-20">Subject:</span>
        <div className="flex-1 font-bold text-white text-sm select-all">
          {emailData.subject}
        </div>
      </div>

      {/* EDIT VS PREVIEW TABS */}
      <div className="flex flex-col gap-2 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Message</span>
          <div className="flex bg-slate-950/80 p-0.5 rounded-lg border border-slate-850">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'preview' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('edit')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${activeTab === 'edit' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Edit Body
            </button>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-850 rounded-xl p-4 md:p-6 min-h-[300px] flex flex-col justify-between">
          {activeTab === 'preview' ? (
            <div className="text-sm text-slate-350 select-text font-sans">
              <p className="font-bold text-white mb-4">{emailData.greeting}</p>
              <div className="space-y-3">{renderBodyHTML(editableBody)}</div>
              <p className="mt-4 text-slate-350">{emailData.closing}</p>
              
              {/* Signature block with subtle top line */}
              {emailData.signature_block && (
                <div className="mt-6 pt-4 border-t border-slate-850 font-mono text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {emailData.signature_block}
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={editableBody}
              onChange={(e) => setEditableBody(e.target.value)}
              className="w-full h-72 bg-slate-950 border-0 p-0 text-sm text-white focus:outline-none focus:ring-0 resize-y font-mono leading-relaxed"
              placeholder="Write or edit the body paragraphs here..."
              disabled={sent || sending}
            />
          )}
        </div>
      </div>

      {/* METRICS & SKILLS BAR */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-t border-b border-slate-850 bg-slate-950/20 px-3 rounded-xl text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-slate-500 uppercase tracking-wider">Mode:</span>
          <span className="uppercase text-indigo-400 font-bold">{emailData.mode_used}</span>
        </div>
        <div className="flex items-center gap-1.5 border-l pl-4 border-slate-800">
          <span className="font-bold text-slate-500 uppercase tracking-wider">Words:</span>
          <span className="text-slate-300 font-semibold">{emailData.word_count}</span>
        </div>
        
        {emailData.matched_skills && emailData.matched_skills.length > 0 && (
          <div className="flex items-center gap-2 border-l pl-4 border-slate-800 flex-1">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Matched Skills:</span>
            <div className="flex flex-wrap gap-1">
              {emailData.matched_skills.map((skill, idx) => (
                <span key={idx} className="bg-indigo-500/10 text-indigo-300 text-[10px] px-2 py-0.5 rounded border border-indigo-500/20 font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACTION BAR */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onRegenerate}
          disabled={sending}
          className="text-slate-400 hover:text-white text-xs font-semibold px-4 py-2 border border-slate-800 rounded-lg hover:bg-slate-900 transition-colors disabled:opacity-50"
        >
          ↻ Regenerate
        </button>
        <button
          onClick={handleCopyAndLog}
          disabled={sending}
          className={`px-6 py-3 font-bold rounded-lg text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 ${
            sent 
              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
              : 'bg-indigo-600 text-white hover:bg-indigo-500'
          }`}
        >
          {sending && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {sending ? 'Logging...' : sent ? 'Copied & Logged ✓' : 'Copy Email & Log Application →'}
        </button>
      </div>

      {/* SUCCESS/ERROR NOTIFICATIONS */}
      {sent && (
        <div className="mt-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex flex-col gap-1 items-start text-xs">
          <span className="text-green-400 font-bold">✓ Email copied to clipboard & logged under {jobInput.hr_email}</span>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-1 font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            View in Tracker Dashboard →
          </button>
        </div>
      )}
      {sendError && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 font-semibold">
          Failed to log: {sendError}
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
