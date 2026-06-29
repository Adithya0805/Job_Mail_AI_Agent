import { create } from 'zustand';

// Zustand store for bulk session state
const useBulkStore = create((set, get) => ({
  raw_file: null,
  parsed_jobs: [],
  invalid_jobs: [],
  mode_override: null,
  session_status: "idle", // idle | ready | generating | reviewing | sending | done | error
  
  setFile: async (file, parsedData) => {
    set({
      raw_file: file,
      parsed_jobs: parsedData.valid,
      invalid_jobs: parsedData.invalid,
      session_status: parsedData.valid.length > 0 ? "ready" : "idle"
    });
  },
  
  setModeOverride: (mode) => set({ mode_override: mode }),
  
  setStatus: (status) => set({ session_status: status }),
  
  resetSession: () => set({
    raw_file: null,
    parsed_jobs: [],
    invalid_jobs: [],
    mode_override: null,
    session_status: "idle"
  }),
  
  getEffectiveJobs: () => {
    const { parsed_jobs, mode_override } = get();
    if (!mode_override) return parsed_jobs;
    return parsed_jobs.map(job => ({ ...job, mode: mode_override }));
  }
}));

export default useBulkStore;
