import React from 'react';
import { useNavigate } from 'react-router-dom';
import { generateBulkReport } from '../utils/reportGenerator';

const BulkSendPanel = ({ useBulkSendHook, originalResults }) => {
  const { sendResults, complete, stats, total, sending } = useBulkSendHook;
  const navigate = useNavigate();

  const pendingCount = total - (stats.sent + stats.failed);
  const estimatedSeconds = pendingCount * 2;

  const formatTime = (secs) => {
    if (secs <= 0) return 'Almost done';
    if (secs < 60) return `~${secs} sec remaining`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `~${m} min ${s} sec remaining`;
  };

  const progressPercent = total === 0 ? 0 : Math.round(((stats.sent + stats.failed) / total) * 100);

  const handleDownloadReport = () => {
    // Merge sendResults with the original email data for the report
    const fullResults = sendResults.map(r => {
      const orig = originalResults.find(o => o.company === r.company);
      return { ...r, email_data: orig?.email_data };
    });
    generateBulkReport(fullResults);
  };

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Section */}
      {!complete ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Sending emails... {stats.sent + stats.failed} / {total} sent
              </h2>
              <p className="text-sm text-gray-500 mt-1">{formatTime(estimatedSeconds)}</p>
            </div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Send Complete</h2>
          <div className="text-gray-600 mb-6 space-y-1">
            <p className="font-medium text-green-600">✓ {stats.sent} emails sent successfully</p>
            {stats.failed > 0 && <p className="font-medium text-red-600">✗ {stats.failed} failed</p>}
            <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
              All sent emails logged to Applications
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
            >
              View Dashboard
            </button>
            <button 
              onClick={handleDownloadReport}
              className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
            >
              Download Report
            </button>
          </div>
        </div>
      )}

      {/* Middle Section - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sendResults.map((job) => (
          <div key={job.index} className={`p-4 rounded-lg border bg-white shadow-sm flex flex-col justify-between
            ${job.status === 'failed' ? 'border-red-200' : 
              job.status === 'sent' ? 'border-green-200' : 
              job.status === 'sending' ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-200'}
          `}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{job.company}</h3>
                </div>
                <div>
                  {job.status === 'queued' && <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">⏳ Queued</span>}
                  {job.status === 'sending' && <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 rounded-full flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> Sending...</span>}
                  {job.status === 'sent' && <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">✓ Sent</span>}
                  {job.status === 'failed' && <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">✗ Failed</span>}
                </div>
              </div>
              
              {job.status === 'sent' && (
                <p className="text-[10px] text-gray-400 mt-2 truncate">Message ID: {job.message_id}</p>
              )}
              {job.status === 'failed' && (
                <p className="text-xs text-red-600 mt-2 truncate" title={job.error}>{job.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BulkSendPanel;
