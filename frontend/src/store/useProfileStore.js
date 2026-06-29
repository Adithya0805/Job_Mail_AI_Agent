import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Zustand store for managing user profile, job input, and email generation payload
const useProfileStore = create(
  persist(
    (set, get) => ({
      profile: {
        full_name: '',
        email: '',
        phone: '',
        location: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        degree: '',
        institution: '',
        graduation_year: '',
        cgpa: '',
        experience_level: '',
        skills_languages: [],
        skills_frameworks: [],
        skills_ai_ml: [],
        projects: [],
        certifications: [],
        summary: '',
      },
      job_input: {
        hr_email: '',
        job_description: '',
      },
      selected_mode: '',
      final_payload: null,

      updateProfile: (updates) =>
        set((state) => ({ profile: { ...state.profile, ...updates } })),

      updateJobInput: (updates) =>
        set((state) => ({ job_input: { ...state.job_input, ...updates } })),

      setSelectedMode: (mode) => set({ selected_mode: mode }),

      buildPayload: () => {
        const { profile, job_input, selected_mode } = get();
        const payload = {
          profile,
          job_input,
          selected_mode,
        };
        set({ final_payload: payload });
        return payload;
      },
    }),
    {
      name: 'job-mail-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        profile: state.profile,
        job_input: state.job_input,
        selected_mode: state.selected_mode,
      }), // only persist these fields
    }
  )
);

export default useProfileStore;
