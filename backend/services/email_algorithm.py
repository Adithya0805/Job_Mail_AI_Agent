# Email generation algorithm pipeline matching candidate profile details to JD requirements
import json
import httpx
import os
from services.gemini_service import GeminiService

class EmailAlgorithmService:
    def __init__(self):
        self.llm_service = GeminiService()

    def match_jd_to_profile(self, jd_analysis: dict, profile: dict) -> dict:
        prompt = f"""You are an expert technical recruiter analyzing the fit between a candidate's profile and a job description.
        
Candidate Profile:
{json.dumps(profile, indent=2)}

Job Description Analysis:
{json.dumps(jd_analysis, indent=2)}

Analyze the fit and extract:
1. matched_skills: a list of objects showing which required/preferred skills in the JD are present in the candidate's profile. Each object must have:
   - "skill": name of the skill from JD
   - "jd_mentioned": true (if explicitly in JD)
   - "profile_evidence": direct evidence/projects from the profile supporting this skill.
2. matched_projects: a list of objects linking the candidate's projects to the JD's requirements. Each object must have:
   - "project_name": name of the project
   - "relevance_reason": why this project matches what the JD asks for
   - "proof_point": a specific metrics-driven or technical proof point (e.g. "94% accuracy", "deployed on AWS", "fast response time").
3. unmatched_jd_requirements: a list of skills or requirements mentioned in the JD that the candidate's profile does NOT show. Do not fabricate or infer.
4. match_strength: "strong" (matches most key requirements + has proof points), "moderate" (matches core requirements but has gaps/fewer proof points), or "weak" (major gaps, minimal matching skills).

Return ONLY valid JSON matching this exact structure:
{{
  "matched_skills": [
    {{ "skill": "string", "jd_mentioned": true, "profile_evidence": "string" }}
  ],
  "matched_projects": [
    {{ "project_name": "string", "relevance_reason": "string", "proof_point": "string" }}
  ],
  "unmatched_jd_requirements": ["string"],
  "match_strength": "strong | moderate | weak"
}}
"""
        try:
            return self.llm_service._call_llm_json(prompt, temperature=0.1)
        except Exception as e:
            # Fallback in case of parsing error
            print(f"Error in match_jd_to_profile: {str(e)}")
            return {
                "matched_skills": [],
                "matched_projects": [],
                "unmatched_jd_requirements": [],
                "match_strength": "moderate"
            }

    def select_proof_points(self, matched_skills: list, matched_projects: list, max_bullets: int) -> list:
        candidates = []
        
        # Add project candidates
        for proj in matched_projects:
            name = proj.get("project_name") or ""
            reason = proj.get("relevance_reason") or ""
            proof = proj.get("proof_point") or ""
            
            detail = f"Built {name} to {reason.lower()}"
            if proof and proof != "null":
                detail += f" ({proof})"
            
            # Score: prioritizes metrics-driven outcomes (has %, numbers, or specific words like AWS)
            score = 3
            if any(char.isdigit() or char in ["%", "$"] for char in proof):
                score += 2
            if any(kw in proof.lower() for kw in ["aws", "cloud", "deployed", "scaled"]):
                score += 1

            candidates.append({
                "category": name,
                "detail": detail,
                "score": score,
                "type": "project"
            })
            
        # Add skill candidates
        for sk in matched_skills:
            skill_name = sk.get("skill") or ""
            evidence = sk.get("profile_evidence") or ""
            
            if not skill_name or not evidence:
                continue
                
            score = 2
            if any(char.isdigit() for char in evidence):
                score += 1

            candidates.append({
                "category": skill_name,
                "detail": evidence,
                "score": score,
                "type": "skill"
            })
            
        # Sort by score descending
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Enforce diversity: try to select a mix of projects and skills
        selected = []
        used_categories = set()
        
        for item in candidates:
            if len(selected) >= max_bullets:
                break
            cat_lower = item["category"].lower().strip()
            if cat_lower not in used_categories:
                selected.append(item)
                used_categories.add(cat_lower)
                
        if len(selected) < max_bullets:
            for item in candidates:
                if len(selected) >= max_bullets:
                    break
                if item not in selected:
                    selected.append(item)
                    
        return selected

    def build_bullet_content(self, proof_points: list) -> list:
        bullets = []
        for pt in proof_points:
            cat = pt["category"]
            detail = pt["detail"]
            
            # Shorten if too long (under 20 words)
            words = detail.split()
            if len(words) > 18:
                detail = " ".join(words[:18]) + "..."
                
            bullets.append(f"{cat} — {detail}")
        return bullets

    def build_generation_prompt(self, profile: dict, jd_analysis: dict, matches: dict, bullets: list, mode: str, 
                                recipient_name: str | None, availability: str | None, 
                                portfolio_url: str | None, github_url: str | None, 
                                additional_info: str | None, company_name: str | None) -> str:
        
        greeting_target = recipient_name if recipient_name else "Hiring Manager"
        target_company = company_name if company_name else jd_analysis.get("company_signals", "your company")
        
        avail_line = ""
        if availability:
            avail_line = f"Currently based in {profile.get('location', 'my location')}, and {availability}."
            
        sig_lines = [profile.get("full_name", "")]
        if profile.get("phone"):
            sig_lines.append(profile.get("phone"))
        if profile.get("email"):
            sig_lines.append(profile.get("email"))
        if github_url:
            sig_lines.append(github_url)
        if portfolio_url:
            sig_lines.append(portfolio_url)
        sig_block = "\n".join(sig_lines)

        bullets_text = "\n".join([f"- {b}" for b in bullets])

        prompt = f"""You are an expert AI assistant writing a tailored cold email for a job application.
Generate the email based on the following candidate profile, job description, matches, and mode rules.

Candidate Profile:
{json.dumps(profile, indent=2)}

Job Description Analysis:
{json.dumps(jd_analysis, indent=2)}

JD-to-Profile Matches:
{json.dumps(matches, indent=2)}

Custom VITAL Guidelines (AI Specific Memory):
"{profile.get("specific_memory", "")}"

Additional Context for this application:
"{additional_info or ''}"

"""
        if mode.lower() == "simple":
            prompt += f"""
Mode: SIMPLE
Rules:
- CASUAL, flowing paragraph style (no bullet points).
- Maximum 150 words.
- Mention 2 matching skills naturally.
- Keep the tone light, professional, and direct.
"""
        elif mode.lower() == "professional":
            prompt += f"""
Mode: PROFESSIONAL
Rules:
- Use a structured bullet-point format.
- Greeting: "Dear {greeting_target},"
- Opening: One direct sentence stating the role and company (e.g. "I am writing to apply for the [Role] position at {target_company}.") - NO throat-clearing.
- Context line: "I am a [Year] [Degree] graduate in [Field] from [Institution] with a CGPA of [CGPA]. My background aligns directly with your requirements:" (fill in using candidate profile).
- Body: Include these exact bullet points:
{bullets_text}
- Closing: "{avail_line if availability else 'I would welcome the opportunity to discuss further.'} Please find my resume attached. I look forward to the opportunity to meet your team. Thank you for your time."
- Sign-off: "Best regards,"
- Signature Block (Exact format, each on separate line):
{sig_block}
"""
        else: # Advanced mode
            unmatched_text = ""
            unmatched = matches.get("unmatched_jd_requirements", [])
            if unmatched:
                unmatched_text = f"We have some gaps in: {', '.join(unmatched)}. Frame these honestly as eagerness to learn/fast adapter, rather than fabricating."
                
            prompt += f"""
Mode: ADVANCED
Rules:
- Use a structured bullet-point format.
- Greeting: "Dear {greeting_target},"
- Opening: One sentence stating the role and company, including one specific detail showing research on the company (e.g. from company_signals in JD analysis: {jd_analysis.get('company_signals', '')}).
- Context line: "I am a [Year] [Degree] graduate in [Field] from [Institution] with a CGPA of [CGPA]. My background aligns directly with your requirements:" (fill in using candidate profile).
- Body: Include these exact bullet points:
{bullets_text}
- Handle Gaps: {unmatched_text} Include a short line addressing one gap honestly.
- Closing: "{avail_line if availability else 'I am available for interviews and would love to connect.'} Please find my resume attached. I look forward to contributing to your team. Thank you for your time."
- Sign-off: "Warm regards,"
- Signature Block (Exact format, each on separate line):
{sig_block}
"""

        prompt += f"""
Return ONLY a valid JSON object. No explanation. No markdown code blocks.
Expected JSON Structure:
{{
  "subject": "Tailored subject line",
  "greeting": "Dear ...",
  "body": "The main body text of the email (in professional/advanced modes, include the bullet points as raw text with hyphens)",
  "closing": "Closing line and sign-off (e.g., Best regards, or Warm regards,)",
  "signature_block": "{sig_block.replace('\n', '\\n')}",
  "matched_skills": {json.dumps(matches.get('matched_skills', []))},
  "match_strength": "{matches.get('match_strength', 'moderate')}",
  "mode_used": "{mode}",
  "word_count": number
}}
"""
        return prompt

    def generate_email(self, payload: dict) -> dict:
        profile = payload.get("profile", {})
        job_input = payload.get("job_input", {})
        mode = payload.get("selected_mode", "professional")
        
        recipient_name = payload.get("recipient_name") or job_input.get("recipient_name")
        company_name = payload.get("company_name") or job_input.get("company_name")
        availability = payload.get("availability_window") or job_input.get("availability_window")
        additional_info = payload.get("additional_info") or job_input.get("additional_info")
        
        portfolio_url = profile.get("portfolio_url")
        github_url = profile.get("github_url")
        
        # Step 1: Analyze Job Description
        jd_analysis = self.llm_service.analyze_jd(job_input.get("job_description", ""))
        
        # Step 2: Recruiter Fit Assessment
        matches = self.match_jd_to_profile(jd_analysis, profile)
        
        # Step 3 & 4: Proof point selection and formatting
        bullets = []
        if mode.lower() in ["professional", "advanced"]:
            max_bullets = 5 if mode.lower() == "advanced" else 4
            proof_points = self.select_proof_points(
                matches.get("matched_skills", []), 
                matches.get("matched_projects", []), 
                max_bullets
            )
            bullets = self.build_bullet_content(proof_points)

        # Step 5: Prompt construction
        prompt = self.build_generation_prompt(
            profile, jd_analysis, matches, bullets, mode, 
            recipient_name, availability, portfolio_url, github_url, 
            additional_info, company_name
        )
        
        # Step 6 & 7: Call LLM and parse
        response = self.llm_service._call_llm_json(prompt, temperature=0.2)
        return response
