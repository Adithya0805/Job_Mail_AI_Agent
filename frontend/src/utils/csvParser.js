// Utility to parse and validate CSV files for Bulk Apply

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const extractCompany = (email) => {
  try {
    const domain = email.split('@')[1];
    const parts = domain.split('.');
    if (parts.length > 2) {
      if (['co', 'com', 'org', 'net', 'io'].includes(parts[parts.length - 2]) && parts.length >= 3) {
        return parts[parts.length - 3].charAt(0).toUpperCase() + parts[parts.length - 3].slice(1);
      }
      return parts[parts.length - 2].charAt(0).toUpperCase() + parts[parts.length - 2].slice(1);
    }
    return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
  } catch {
    return "Unknown";
  }
};

const extractRole = (jd) => {
  if (!jd) return "Unknown Role";
  let role = jd.split('\n')[0].trim().substring(0, 60);
  role = role.replace(/[^\w\s]+$/, '');
  return role || "Unknown Role";
};

export const parseCSV = (file) => {
  return new Promise((resolve, reject) => {
    // Check file size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      resolve({ valid: [], invalid: [], total: 0, error: 'File size exceeds 2MB limit' });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data;
        const valid = [];
        const invalid = [];
        const total = rows.length;

        if (total > 25) {
          resolve({ valid: [], invalid: [], total, error: 'File exceeds 25 job limit' });
          return;
        }

        rows.forEach((row, idx) => {
          const hr_email = (row.hr_email || '').trim();
          const job_description = (row.job_description || '').trim();
          const mode = (row.mode || '').trim().toLowerCase();
          
          let error_reason = null;

          if (!hr_email || !isValidEmail(hr_email)) {
            error_reason = 'Invalid email format';
          } else if (!job_description || job_description.length < 50) {
            error_reason = 'JD too short (min 50 chars)';
          } else if (!['simple', 'professional', 'advanced'].includes(mode)) {
            error_reason = 'Unknown mode (must be simple/professional/advanced)';
          }

          if (error_reason) {
            invalid.push({ row_number: idx + 2, raw_data: row, error_reason });
          } else {
            let company_name = (row.company_name || '').trim();
            if (!company_name) company_name = extractCompany(hr_email);

            let role = (row.role || '').trim();
            if (!role) role = extractRole(job_description);

            valid.push({
              id: `job-${idx}`,
              hr_email,
              job_description,
              mode,
              company_name,
              role
            });
          }
        });

        resolve({ valid, invalid, total });
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
