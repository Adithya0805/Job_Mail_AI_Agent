import React, { useState, useEffect } from 'react';

const BulkProgressPanel = ({ useBulkGenerateHook, onReview }) => {
  const { results, complete, stats, stopGeneration, total, generating } = useBulkGenerateHook;
  
  const pendingCount = total - (stats.generated + stats.failed);
  const estimatedSeconds = pendingCount * 4;
  
  const formatTime = (secs) => {
    if (secs <= 0) return 'Almost done';
    if (secs < 60) return `~${secs} sec remaining`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `~${m} min ${s} sec remaining`;
  };

  const progressPercent = total === 0 ? 0 : Math.round(((stats.generated + stats.failed) / total) * 100);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Top Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {complete ? 'Generation Complete' : `Generating emails... ${stats.generated + stats.failed} / ${total} complete`}
            </h2>
            {!complete && (
              <p className="text-sm text-gray-500 mt-1">{formatTime(estimatedSeconds)}</p>
            )}
          </div>
          {generating && (
            <button 
              onClick={stopGeneration}
              className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded hover:bg-red-100 transition-colors"
            >
              Stop
            </button>
          )}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      </div>

      {/* Middle Section - Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((job) => (
          <div key={job.index} className={`p-4 rounded-lg border bg-white shadow-sm flex flex-col justify-between
            ${job.status === 'failed' ? 'border-red-200' : 
              job.status === 'generated' ? 'border-green-200' : 
              job.status === 'generating' ? 'border-amber-300 ring-2 ring-amber-100' : 'border-gray-200'}
          `}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-800">{job.company}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">{job.role}</p>
                </div>
                <div>
                  {job.status === 'pending' && <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center gap-1">⏳ Pending</span>}
                  {job.status === 'generating' && <span className="text-xs font-medium px-2 py-1 bg-amber-100 text-amber-700 rounded-full flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Generating...</span>}
                  {job.status === 'generated' && <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">✓ Generated</span>}
                  {job.status === 'failed' && <span className="text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded-full flex items-center gap-1">✗ Failed</span>}
                </div>
              </div>
              
              {job.status === 'generated' && job.email_data?.matched_skills && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {job.email_data.matched_skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100">{s}</span>
                  ))}
                  {job.email_data.matched_skills.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 text-gray-400">+{job.email_data.matched_skills.length - 3}</span>
                  )}
                </div>
              )}
              {job.status === 'failed' && (
                <p className="text-xs text-red-600 mt-2 truncate" title={job.error}>{job.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Section */}
      {complete && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center sticky bottom-4 z-10">
          <div className="font-medium text-gray-700">
            <span className="text-green-600">✓ {stats.generated} emails generated</span>
            <span className="mx-2">·</span>
            <span className={stats.failed > 0 ? "text-red-600" : "text-gray-500"}>{stats.failed} failed</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={onReview}
              disabled={stats.generated === 0}
              className={`px-6 py-2 rounded font-medium transition-colors ${
                stats.generated > 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              Review & Send All →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkProgressPanel;
