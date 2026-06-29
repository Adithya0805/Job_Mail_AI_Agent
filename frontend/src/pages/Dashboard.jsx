import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../hooks/useApplications';

const Dashboard = () => {
  const { applications, loading, stats, updateStatus, deleteApplication } = useApplications();
  const navigate = useNavigate();
  
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('Newest');

  const filteredAndSortedApps = useMemo(() => {
    let filtered = applications;
    
    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(app => app.status.toLowerCase() === filterStatus.toLowerCase());
    }
    
    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(app => 
        app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.role?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort
    return filtered.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
    });
  }, [applications, filterStatus, searchQuery, sortOrder]);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - d);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusColors = {
    sent: 'bg-gray-100 text-gray-800',
    replied: 'bg-blue-100 text-blue-800',
    interview: 'bg-amber-100 text-amber-800',
    offer: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  const modeColors = {
    simple: 'bg-gray-100 text-gray-800',
    professional: 'bg-blue-100 text-blue-800',
    advanced: 'bg-purple-100 text-purple-800'
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this application log?")) {
      deleteApplication(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
          <svg className="w-20 h-20 mx-auto text-blue-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <h2 className="text-xl font-bold text-gray-800 mb-2">No applications yet</h2>
          <p className="text-gray-500 mb-6">Generate your first email to get started</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
          >
            Go Generate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-800">Job Applications</h1>
          
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200">Total: {stats.total}</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium border border-gray-200">Sent: {stats.sent}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">Replied: {stats.replied}</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium border border-amber-200">Interview: {stats.interview}</span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">Offer: {stats.offer}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <input 
            type="text" 
            placeholder="Search company or role..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          
          <div className="flex gap-4">
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Sent">Sent</option>
              <option value="Replied">Replied</option>
              <option value="Interview">Interview</option>
              <option value="Rejected">Rejected</option>
              <option value="Offer">Offer</option>
            </select>
            
            <select 
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="Newest">Newest first</option>
              <option value="Oldest">Oldest first</option>
            </select>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
                  <th className="p-4">Company</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Mode</th>
                  <th className="p-4">Skills Matched</th>
                  <th className="p-4">Sent Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedApps.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No applications match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAndSortedApps.map((app) => {
                    const skills = Array.isArray(app.matched_skills) ? app.matched_skills : [];
                    const displaySkills = skills.slice(0, 3);
                    const moreSkillsCount = skills.length - 3;
                    const mode = app.mode_used?.toLowerCase() || 'simple';

                    return (
                      <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors group">
                        <td className="p-4 font-medium text-gray-900">{app.company_name}</td>
                        <td className="p-4 text-gray-600 text-sm max-w-[200px] truncate" title={app.role}>{app.role}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${modeColors[mode] || modeColors.simple} capitalize`}>
                            {mode}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap gap-1">
                            {displaySkills.map((s, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded border border-gray-200 whitespace-nowrap">
                                {s}
                              </span>
                            ))}
                            {moreSkillsCount > 0 && (
                              <span className="text-xs px-2 py-0.5 text-gray-500 italic whitespace-nowrap">
                                +{moreSkillsCount} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-gray-500 text-sm whitespace-nowrap">
                          {formatDate(app.created_at)}
                        </td>
                        <td className="p-4">
                          <select
                            value={app.status || 'sent'}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            className={`text-sm px-2 py-1 rounded border-none font-medium focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer ${statusColors[app.status || 'sent']}`}
                          >
                            <option value="sent" className="bg-white text-gray-800">Sent</option>
                            <option value="replied" className="bg-white text-gray-800">Replied</option>
                            <option value="interview" className="bg-white text-gray-800">Interview</option>
                            <option value="rejected" className="bg-white text-gray-800">Rejected</option>
                            <option value="offer" className="bg-white text-gray-800">Offer</option>
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleDelete(app.id)}
                            className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
