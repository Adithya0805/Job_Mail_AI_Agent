export const generateBulkReport = (session_results) => {
  // Columns: Company | Role | HR Email | Mode | Subject | Matched Skills | Word Count | Status | Message ID | Sent At
  const headers = [
    "Company", "Role", "HR Email", "Mode", "Subject", 
    "Matched Skills", "Word Count", "Status", "Message ID", "Sent At"
  ];

  const rows = session_results.map(r => {
    const d = r.email_data || {};
    const status = r.status === 'sent' ? 'Sent' : 'Failed';
    const msgId = r.message_id || r.error || '';
    const skills = d.matched_skills ? d.matched_skills.join('; ') : '';
    const sentAt = r.status === 'sent' ? new Date().toISOString() : '';

    return [
      `"${r.company || ''}"`,
      `"${d.role || ''}"`,
      `"${d.to || d.hr_email || ''}"`,
      `"${d.mode_used || ''}"`,
      `"${(d.subject || '').replace(/"/g, '""')}"`,
      `"${skills}"`,
      d.word_count || 0,
      status,
      `"${msgId.replace(/"/g, '""')}"`,
      sentAt
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `job-mail-report-${dateStr}.csv`;
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
