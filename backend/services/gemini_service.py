import os
import json
import httpx
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Gemini API configuration (if key is present)
gemini_key = os.environ.get("GEMINI_API_KEY")
if gemini_key:
    genai.configure(api_key=gemini_key)

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
                    raise Exception(f"Failed to generate valid JSON via Gemini after {retries + 1} attempts: {str(e)}")

    def _call_llm_json(self, prompt: str, temperature: float = 0.7) -> dict:
        """Calls Groq if GROQ_API_KEY is present, otherwise falls back to Gemini."""
        groq_key = os.environ.get("GROQ_API_KEY")
        if groq_key:
            # Use Groq Llama 3 (completely free and allows datacenter calls without blocks)
            url = "https://api.groq.com/openai/v1/chat/completions"
            headers = {
                "Authorization": f"Bearer {groq_key}",
                "Content-Type": "application/json"
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "temperature": temperature,
                "response_format": {"type": "json_object"}
            }
            try:
                with httpx.Client() as client:
                    response = client.post(url, headers=headers, json=payload, timeout=30.0)
                    if response.status_code != 200:
                        raise Exception(f"Groq API status {response.status_code}: {response.text}")
                    data = response.json()
                    content = data["choices"][0]["message"]["content"].strip()
                    return json.loads(content)
            except Exception as e:
                raise Exception(f"Groq API call failed: {str(e)}")
        else:
            # Fallback to standard Gemini API
            if not os.environ.get("GEMINI_API_KEY"):
                raise ValueError("Both GROQ_API_KEY and GEMINI_API_KEY are missing. Please configure at least one LLM key in Railway.")
            return self._call_gemini_json(prompt, temperature)

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
        return self._call_llm_json(prompt, temperature=0.2)

    def build_email_prompt(self, profile: dict, jd_analysis: dict, mode: str, specific_memory: str = "") -> str:
        memory_instruction = ""
        if specific_memory:
            memory_instruction = f"""
===================================================
CRITICAL VITAL DIRECTIONS / SPECIFIC MEMORY:
You MUST prioritize and strictly follow these custom user guidelines when writing the content:
"{specific_memory}"
Ensure the tone, selected highlights, and specific guidelines are fully incorporated.
===================================================
"""

        prompt = f"""You are an expert AI assistant writing a tailored cold email for a job application.
Generate the email based on the following rules, the candidate's profile, and the job description analysis.
{memory_instruction}

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
        specific_memory = payload.get("specific_memory", "") or profile.get("specific_memory", "")

        # Step 1: Analyze JD
        jd_analysis = self.analyze_jd(job_description)

        # Step 2: Build email prompt
        prompt = self.build_email_prompt(profile, jd_analysis, mode, specific_memory)

        # Step 3: Call LLM with correct temperature based on mode
        temperature_map = {
            "simple": 0.7,
            "professional": 0.5,
            "advanced": 0.4
        }
        temperature = temperature_map.get(mode, 0.5)

        # Step 4: Parse and return response
        email_data = self._call_llm_json(prompt, temperature=temperature)
        return email_data
