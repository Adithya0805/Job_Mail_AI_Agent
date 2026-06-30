// Component for uploading and initiating AI resume parsing in dark-mode glassmorphic style
import React, { useState, useRef } from 'react';
import { parseResume } from '../services/api';

export default function ResumeUpload({ onParsed, onManual }) {
  const [status, setStatus] = useState('idle'); // idle, uploading, parsing, success, error
  const [error, setError] = useState(null);
  const [filename, setFilename] = useState('');
  const [filesize, setFilesize] = useState('');
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (status === 'uploading' || status === 'parsing') return;
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const triggerBrowse = () => {
    if (status === 'uploading' || status === 'parsing') return;
    fileInputRef.current.click();
  };

  const processFile = async (file) => {
    // 1. Check extension
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setStatus('error');
      setError("Only PDF and DOCX files are allowed. Please try a different document.");
      return;
    }

    // 2. Check size (max 5MB)
    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      setStatus('error');
      setError("File is too large (max 5MB). Please optimize or try a smaller file.");
      return;
    }

    setFilename(file.name);
    setFilesize((file.size / (1024 * 1024)).toFixed(2) + " MB");
    setStatus('uploading');
    setError(null);

    try {
      // Step 1: Simulate the upload phase for 1.2s to show distinct UX state
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Step 2: Transition to parsing
      setStatus('parsing');
      
      // Step 3: Run the real API parser call
      const res = await parseResume(file);
      
      setStatus('success');
      // Let success state settle for 1s then bubble up the parsed results
      setTimeout(() => {
        onParsed(res);
      }, 1000);

    } catch (err) {
      setStatus('error');
      setError(err.message || "Couldn't read this file — try a different PDF/DOCX, or fill in manually");
    }
  };

  const resetUpload = () => {
    setStatus('idle');
    setError(null);
    setFilename('');
    setFilesize('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-900/40 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-sm text-center shadow-xl">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,.docx" 
        className="hidden" 
      />

      {status === 'idle' && (
        <>
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={triggerBrowse}
            className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-950/20 hover:bg-indigo-950/10 rounded-xl p-8 cursor-pointer transition-all flex flex-col items-center group"
          >
            <div className="w-16 h-16 rounded-full bg-slate-950 text-indigo-400 border border-slate-850 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-inner">
              {/* ti-file-upload svg */}
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Upload your resume</h3>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              We'll fill in your profile automatically — PDF or DOCX, takes about 10 seconds
            </p>
            <div className="mt-4 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              PDF or DOCX, max 5MB
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <div className="text-xs text-slate-600">— or —</div>
            <button 
              onClick={onManual}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
            >
              Fill in manually instead
            </button>
          </div>
        </>
      )}

      {(status === 'uploading' || status === 'parsing') && (
        <div className="py-12 flex flex-col items-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-850"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
          </div>
          <h4 className="text-white font-bold text-lg mb-2">
            {status === 'uploading' ? 'Reading your resume...' : 'Extracting your skills and experience...'}
          </h4>
          <p className="text-xs text-slate-400">
            {filename} ({filesize})
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-12 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-400 border border-green-500/20 flex items-center justify-center mb-6 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h4 className="text-green-400 font-bold text-lg mb-2">Profile ready — review below</h4>
          <p className="text-xs text-slate-400">
            Preparing your review form...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h4 className="text-red-400 font-semibold mb-2">Upload Failed</h4>
          <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
            {error}
          </p>
          <div className="flex gap-4">
            <button 
              onClick={resetUpload}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-white text-xs font-semibold rounded-lg transition-colors"
            >
              Try Another File
            </button>
            <button 
              onClick={onManual}
              className="px-4 py-2 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Fill Manually
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
