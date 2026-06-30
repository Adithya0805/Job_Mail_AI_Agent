import React, { useRef, useState, useEffect } from 'react';
import { parseCSV } from '../utils/csvParser';
import useBulkStore from '../store/useBulkStore';
import useProfileStore from '../store/useProfileStore';
import { useBulkGenerate } from '../hooks/useBulkGenerate';
import { useBulkSend } from '../hooks/useBulkSend';

import BulkProgressPanel from '../components/BulkProgressPanel';
import BulkReviewPanel from '../components/BulkReviewPanel';
import BulkSendPanel from '../components/BulkSendPanel';

const SAMPLE_CSV = `hr_email,job_description,mode,company_name,role
hr@infosys.com,"We are hiring a Python developer with 0-2 years exp...",professional,Infosys,Python Developer
careers@zoho.com,"Looking for ML Engineer with LangChain experience...",advanced,Zoho,ML Engineer`;

const BulkApply = () => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Stores
  const { 
    raw_file, parsed_jobs, invalid_jobs, mode_override, session_status,
    setFile, setModeOverride, setStatus, resetSession, getEffectiveJobs
  } = useBulkStore();
  const profile = useProfileStore(state => state.buildPayload)().profile;

  // Hooks
  const generateHook = useBulkGenerate();
  const sendHook = useBulkSend();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      generateHook.stopGeneration();
    };
  }, []);

  const handleDownloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "job-mail-sample.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async (file) => {
    setErrorMsg('');
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a valid .csv file');
      return;
    }
    
    try {
      const parsedData = await parseCSV(file);
      if (parsedData.error) {
        setErrorMsg(parsedData.error);
        return;
      }
      await setFile(file, parsedData);
    } catch (err) {
      setErrorMsg('Error parsing CSV file');
    }
  };

  const onDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleStartGenerate = () => {
    const effectiveJobs = getEffectiveJobs();
    if (effectiveJobs.length === 0) return;
    setStatus('generating');
    generateHook.startGeneration(effectiveJobs, profile, mode_override);
  };

  const handleStartReview = () => {
    setStatus('reviewing');
  };

  const handleStartSend = (selectedEmails) => {
    setStatus('sending');
    sendHook.startSend(selectedEmails);
  };

  const handleBackToReview = () => {
    setStatus('generating'); 
  };

  const handleReupload = () => {
    resetSession();
    generateHook.reset();
    sendHook.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // -------------------------------------------------------------
  // RENDER SECTIONS
  // -------------------------------------------------------------

  if (session_status === 'generating') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <BulkProgressPanel useBulkGenerateHook={generateHook} onReview={handleStartReview} />
        </div>
      </div>
    );
  }

  if (session_status === 'reviewing') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <BulkReviewPanel 
            generatedResults={generateHook.results} 
            onSend={handleStartSend} 
            onBack={handleBackToReview} 
          />
        </div>
      </div>
    );
  }

  if (session_status === 'sending' || session_status === 'done') {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <BulkSendPanel 
            useBulkSendHook={sendHook} 
            originalResults={generateHook.results}
          />
        </div>
      </div>
    );
  }

  // default idle / ready states
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Bulk Apply</h1>
          <p className="text-gray-600 mt-2">Upload a CSV to generate up to 25 tailored applications in bulk.</p>
        </div>

        {/* SECTION 1: Upload Zone */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div 
            className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors relative
              ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}`}
            onDragEnter={onDrag}
            onDragLeave={onDrag}
            onDragOver={onDrag}
            onDrop={onDrop}
            onClick={() => !raw_file && fileInputRef.current.click()}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              className="hidden" 
              onChange={onFileChange}
            />
            
            {raw_file ? (
              <div className="text-center">
                <svg className="w-12 h-12 text-blue-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-lg font-bold text-gray-800">{raw_file.name}</p>
                <p className="text-sm text-gray-500 mt-1">{(raw_file.size / 1024).toFixed(1)} KB</p>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleReupload(); }}
                  className="mt-4 text-blue-600 font-medium hover:underline"
                >
                  Change file
                </button>
              </div>
            ) : (
              <div className="text-center cursor-pointer">
                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <p className="text-lg font-medium text-gray-700">Drop your CSV here or click to browse</p>
                <p className="text-sm text-gray-500 mt-2">Max 25 jobs · .csv files only</p>
              </div>
            )}
          </div>
          
          {errorMsg && (
            <p className="text-red-600 font-medium mt-3 text-center bg-red-50 p-2 rounded">{errorMsg}</p>
          )}

          {!raw_file && (
            <div className="mt-4 text-center">
              <button 
                onClick={handleDownloadSample}
                className="text-sm text-blue-600 font-medium hover:underline"
              >
                Download sample CSV
              </button>
            </div>
          )}
        </div>

        {/* SECTION 2 & 3: Validation & Mode Override */}
        {session_status === 'ready' && (
          <>
            {/* SECTION 3: Mode Override */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">Override Mode</h3>
                  <p className="text-sm text-gray-500">Apply the same generation mode to all valid jobs</p>
                </div>
                <select 
                  value={mode_override || ""}
                  onChange={(e) => setModeOverride(e.target.value || null)}
                  className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Off (Use CSV mode)</option>
                  <option value="simple">Simple</option>
                  <option value="professional">Professional</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* SECTION 2: Validation Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="mb-4 flex flex-col md:flex-row justify-between md:items-end gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    {parsed_jobs.length + invalid_jobs.length} jobs found · 
                    <span className="text-green-600 mx-1">{parsed_jobs.length} valid</span> · 
                    <span className={invalid_jobs.length > 0 ? "text-red-600 mx-1" : "text-gray-500 mx-1"}>{invalid_jobs.length} errors</span>
                  </h3>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[400px]">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 sticky top-0 shadow-sm z-10">
                      <tr className="text-gray-600 text-sm font-semibold border-b border-gray-200">
                        <th className="p-3">#</th>
                        <th className="p-3">Company</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">HR Email</th>
                        <th className="p-3">Mode</th>
                        <th className="p-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {/* Invalid Jobs First */}
                      {invalid_jobs.map((job, idx) => (
                        <tr key={`inv-${idx}`} className="bg-red-50/50">
                          <td className="p-3 text-sm text-gray-500">Row {job.row_number}</td>
                          <td className="p-3 text-sm text-gray-500">{(job.raw_data.company_name || '—').substring(0,20)}</td>
                          <td className="p-3 text-sm text-gray-500">{(job.raw_data.role || '—').substring(0,20)}</td>
                          <td className="p-3 text-sm text-gray-500">{job.raw_data.hr_email || '—'}</td>
                          <td className="p-3 text-sm text-gray-500">{job.raw_data.mode || '—'}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200" title={job.error_reason}>
                              ✗ Invalid
                            </span>
                            <div className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate" title={job.error_reason}>{job.error_reason}</div>
                          </td>
                        </tr>
                      ))}
                      
                      {/* Valid Jobs */}
                      {parsed_jobs.map((job, idx) => (
                        <tr key={job.id} className="hover:bg-gray-50">
                          <td className="p-3 text-sm text-gray-500">{idx + 1}</td>
                          <td className="p-3 font-medium text-gray-900">{job.company_name}</td>
                          <td className="p-3 text-sm text-gray-700 max-w-[150px] truncate" title={job.role}>{job.role}</td>
                          <td className="p-3 text-sm text-gray-700">{job.hr_email}</td>
                          <td className="p-3">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded uppercase font-bold border border-gray-200">
                              {mode_override || job.mode}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 bg-green-50 text-green-700 rounded border border-green-200">
                              ✓ Valid
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-6">
                <div className="text-gray-600 font-medium">
                  {parsed_jobs.length} valid jobs will be processed
                </div>
                <div className="flex gap-4">
                  <button 
                    onClick={handleReupload}
                    className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded hover:bg-gray-50 transition-colors"
                  >
                    Re-upload CSV
                  </button>
                  <button 
                    onClick={handleStartGenerate}
                    disabled={parsed_jobs.length === 0}
                    className={`px-6 py-2 font-bold rounded flex items-center gap-2 transition-all ${
                      parsed_jobs.length > 0 ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Generate All →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default BulkApply;
