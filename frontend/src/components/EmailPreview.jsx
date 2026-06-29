import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSendEmail } from '../hooks/useSendEmail';
import useProfileStore from '../store/useProfileStore';

// EmailPreview component displays the generated email, stats, and provides actions
const EmailPreview = ({ emailData, isLoading, onRegenerate }) => {
  const [editableBody, setEditableBody] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const { send, sending, sent, error: sendError, messageId } = useSendEmail();
  const navigate = useNavigate();

  // For passing JD to backend
  const jobInput = useProfileStore((state) => state.job_input);

  useEffect(() => {
    if (emailData?.body) {
      setEditableBody(emailData.body);
    }
  }, [emailData]);

  const handleCopy = () => {
    if (!emailData) return;
    const fullText = `Subject: ${emailData.subject}\n\n${editableBody}\n\n${emailData.sign_off}`;
    navigator.clipboard.writeText(fullText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleSend = async () => {
    if (!emailData) return;
    try {
      await send({
        to: jobInput.hr_email,
        subject: emailData.subject,
        body: editableBody,
        sign_off: emailData.sign_off,
        mode_used: emailData.mode_used,
        matched_skills: emailData.matched_skills,
        word_count: emailData.word_count,
        job_description: jobInput.job_description
      });
    } catch (err) {
      // Error is handled by the hook and displayed below
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3 mb-6">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!emailData) return null;

  return (
    <div className="w-full bg-white p-6 rounded-lg shadow-sm border border-gray-200 mt-6 flex flex-col gap-4">
      {/* Subject Line */}
      <div className="flex items-center gap-2 border-b pb-4">
        <span className="font-semibold text-gray-700 w-20">Subject:</span>
        <div className="flex-1 font-bold text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
          {emailData.subject}
        </div>
      </div>

      {/* Body Textarea */}
      <div className="flex flex-col gap-2 flex-1">
        <span className="font-semibold text-gray-700">Message:</span>
        <textarea
          value={editableBody}
          onChange={(e) => setEditableBody(e.target.value)}
          className="w-full h-64 p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y text-gray-800"
          disabled={sent || sending}
        />
        <div className="text-gray-700 italic px-2 py-1 bg-gray-50 rounded border border-gray-100">
          {emailData.sign_off}
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex flex-wrap items-center gap-4 py-3 border-t border-b border-gray-100 bg-gray-50 px-3 rounded text-sm">
        <div className="flex items-center gap-1">
          <span className="font-semibold text-gray-600">Mode:</span>
          <span className="uppercase text-blue-600 font-bold">{emailData.mode_used}</span>
        </div>
        <div className="flex items-center gap-1 border-l pl-4 border-gray-300">
          <span className="font-semibold text-gray-600">Words:</span>
          <span>{emailData.word_count}</span>
        </div>
        <div className="flex items-center gap-2 border-l pl-4 border-gray-300 flex-1">
          <span className="font-semibold text-gray-600">Matched Skills:</span>
          <div className="flex flex-wrap gap-1">
            {emailData.matched_skills?.map((skill, idx) => (
              <span key={idx} className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full border border-green-200">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-2">
        <button
          onClick={onRegenerate}
          className="text-blue-600 hover:text-blue-800 font-medium px-4 py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
        >
          ↻ Regenerate
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="px-6 py-2 bg-gray-100 text-gray-800 font-medium rounded hover:bg-gray-200 transition-colors border border-gray-300"
          >
            {copySuccess ? 'Copied!' : 'Copy Email'}
          </button>
          <button
            onClick={handleSend}
            disabled={sent || sending}
            className={`px-6 py-2 font-medium rounded flex items-center gap-2 transition-colors ${
              sent 
                ? 'bg-green-100 text-green-800 border border-green-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {sending && (
              <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {sending ? 'Sending...' : sent ? 'Sent ✓' : 'Send Email →'}
          </button>
        </div>
      </div>
      
      {/* Notifications below buttons */}
      {sent && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded flex flex-col gap-1 items-start">
          <span className="text-green-800 font-medium">✓ Email sent to {jobInput.hr_email}</span>
          <span className="text-gray-500 text-xs">Message ID: {messageId}</span>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-1 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
          >
            View in Applications →
          </button>
        </div>
      )}
      {sendError && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
          <span className="text-red-800 font-medium text-sm">Failed to send: {sendError}</span>
        </div>
      )}
    </div>
  );
};

export default EmailPreview;
