import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Gemini API configuration
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))

class GeminiService:
    def __init__(self):
        self.model_name = "gemini-2.0-flash-lite"

    def _call_gemini_json(self, prompt: str, temperature: float = 0.7, retries: int = 1) -> dict:
        """Helper to call Gemini and ensure valid JSON response with 1 retry."""
        model = genai.GenerativeModel(self.model_name)
        generation_config = genai.types.GenerationConfig(
            temperature=temperature,
            response_mime_type="application/json"
        )
        
        for attempt in range(retries + 1):
            try:
                response = model.generate_content(prompt, generation_config=generation_config)
                # Parse JSON
                # Sometimes gemini returns markdown formatting like ```json ... ``` even with response_mime_type
                text = response.text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.startswith("```"):
                    text = text[3:]
                if text.endswith("```"):
                    text = text[:-3]
                
                return json.loads(text.strip())
            except Exception as e:
                if attempt == retries:
                    raise Exception(f"Failed to generate valid JSON after {retries + 1} attempts: {str(e)}")

    def analyze_jd(self, job_description: str) -> dict:
        prompt = f"""Analyze this job description and extract:
1. required_skills: list of technical skills mentioned
2. preferred_skills: nice-to-have skills
3. role_seniority: fresher / junior / mid / senior
4. role_type: the job category (ML Engineer, Backend Dev, etc.)
5. company_signals: tone clues (startup/corporate/research)
6. key_responsibilities: top 3 responsibilities in plain English
Return ONLY valid JSON. No explanation.

Job Description:
{job_description}
"""
        return self._call_gemini_json(prompt, temperature=0.2)

    def build_email_prompt(self, profile: dict, jd_analysis: dict, mode: str) -> str:
        prompt = f"""You are an expert AI assistant writing a tailored cold email for a job application.
Generate the email based on the following rules, the candidate's profile, and the job description analysis.

Candidate Profile:
{json.dumps(profile, indent=2)}

Job Description Analysis:
{json.dumps(jd_analysis, indent=2)}

Mode: {mode.upper()}

Rules for SIMPLE mode:
- Max 150 words
- Casual but professional tone
- Mention only top 2 matching skills
- One project max
- End with: "Would love to connect."

Rules for PROFESSIONAL mode:
- 200-280 words
- Formal structure: Hook -> Skills alignment -> Project proof -> CTA
- Mention top 3-4 matching skills with evidence
- Reference 1-2 relevant projects with outcomes
- End with: "I would welcome the opportunity to discuss further."

Rules for ADVANCED mode:
- 300-400 words
- Strategic structure: 
  Paragraph 1 -> Why this company specifically (from company_signals)
  Paragraph 2 -> Exact skill match with JD (use required_skills list)
  Paragraph 3 -> Strongest project with measurable impact
  Paragraph 4 -> Clear value proposition + CTA
- Mirror JD language where appropriate
- End with: "I am confident I can contribute meaningfully from day one."

Return ONLY valid JSON with this exact schema (no explanation):
{{
  "subject": "Email subject line",
  "body": "The email body without the sign-off",
  "sign_off": "The required sign-off for the selected mode",
  "matched_skills": ["List of candidate skills that matched the JD"],
  "mode_used": "{mode}",
  "word_count": <integer word count of body>
}}
"""
        return prompt

    def generate_email(self, payload: dict) -> dict:
        job_description = payload.get("job_input", {}).get("job_description", "")
        profile = payload.get("profile", {})
        mode = payload.get("selected_mode", "professional").lower()

        # Step 1: Analyze JD
        jd_analysis = self.analyze_jd(job_description)

        # Step 2: Build email prompt
        prompt = self.build_email_prompt(profile, jd_analysis, mode)

        # Step 3: Call Gemini with correct temperature based on mode
        temperature_map = {
            "simple": 0.7,
            "professional": 0.5,
            "advanced": 0.4
        }
        temperature = temperature_map.get(mode, 0.5)

        # Step 4: Parse response
        email_data = self._call_gemini_json(prompt, temperature=temperature)

        # Step 5: Return dict
        return email_data
