import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

/**
 * Universal Fail-Soft LLM Caller:
 * Attempts Gemini 2.5 Flash first, then Groq LPU, and falls back soft if network fails.
 */
export async function callLLMStructured(systemPrompt: string, userPrompt: string): Promise<any | null> {
  // 1. Try Gemini 2.5 Flash
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemPrompt}\n\nTask:\n${userPrompt}` }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] Gemini 2.5 Flash fallback notice:', err.message);
    }
  }

  // 2. Try Groq LPU
  if (GROQ_API_KEY) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'qwen/qwen3.6-27b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2
        })
      });
      if (res.ok) {
        const data = await res.json() as any;
        const text = data.choices?.[0]?.message?.content;
        if (text) return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] Groq LPU fallback notice:', err.message);
    }
  }

  return null;
}

/**
 * 1. Live AI Resume Parsing & Profile Synthesis (From Raw Text)
 */
export async function synthesizeProfileAI(text: string) {
  const systemPrompt = `You are an expert technical recruiter and resume parser for the SkillBridge national platform.
Parse the candidate resume and output strict JSON with this exact schema:
{
  "candidateName": "Full Name",
  "extractedSkills": [
    { "name": "SkillName", "category": "Backend/Frontend/DevOps/Clinical", "level": "ADVANCED/INTERMEDIATE/BEGINNER" }
  ],
  "cgpa": 8.5,
  "degree": "B.Tech Computer Science",
  "branch": "Computer Science & Engineering",
  "institution": "National Institute of Technology",
  "graduationYear": 2026,
  "githubUrl": "https://github.com/..."
}`;

  const result = await callLLMStructured(systemPrompt, text);
  return result;
}

/**
 * 1b. Live AI Multimodal PDF Resume Parsing (Direct Binary Ingestion)
 */
export async function synthesizeProfileFromPdfAI(base64Pdf: string, mimeType = 'application/pdf') {
  if (GEMINI_API_KEY) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'application/pdf',
                  data: base64Pdf
                }
              },
              {
                text: `You are an expert technical recruiter and resume parser for the SkillBridge national platform.
Thoroughly extract all information from this uploaded resume document and output strict JSON matching this exact schema:
{
  "candidateName": "Full Name as written on resume",
  "email": "Email address on resume",
  "phone": "Phone number on resume",
  "degree": "Degree (e.g. B.Tech Computer Science, B.E., BCA, MBBS, etc.)",
  "branch": "Specialization or branch",
  "institution": "Full college or university name",
  "graduationYear": 2026,
  "cgpa": 8.5,
  "githubUrl": "GitHub profile URL if present",
  "linkedinUrl": "LinkedIn profile URL if present",
  "extractedSkills": [
    { "name": "SkillName", "category": "Frontend/Backend/Cloud/Clinical/Data", "level": "ADVANCED/INTERMEDIATE/BEGINNER" }
  ],
  "projects": [
    { "title": "Project Title", "tech": "Technologies used", "description": "Brief summary" }
  ],
  "extractedText": "Complete readable text content extracted from this resume"
}`
              }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });

      if (res.ok) {
        const data = await res.json() as any;
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return JSON.parse(text);
      }
    } catch (err: any) {
      console.warn('[AI Service] Gemini PDF synthesis fallback notice:', err.message);
    }
  }
  return null;
}

/**
 * 2. Live AI Dynamic ATS Resume Scorer & Alignment
 */
export async function scoreAtsAI(resumeText: string, jobDescription: string) {
  const systemPrompt = `You are an enterprise ATS (Applicant Tracking System) parser.
Compare the candidate's resume/skills against the job description and output strict JSON with this schema:
{
  "atsScore": 82,
  "matchingKeywords": ["DOCKER", "PYTHON", "REST APIS"],
  "missingKeywords": ["KUBERNETES", "CI/CD"],
  "recommendation": "Advice on how the candidate can phrase missing skills to maximize ATS ranking."
}`;

  const userPrompt = `Candidate Resume:\n${resumeText}\n\nJob Requisition:\n${jobDescription}`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 3. Live AI Voice Mock Technical Interview Evaluator
 */
export async function evaluateMockInterviewAI(targetRole: string, transcript: string) {
  const systemPrompt = `You are a Senior Principal Architect conducting a technical interview for the role of ${targetRole}.
Evaluate the candidate's answer transcript across technical depth, industry terminology, and delivery clarity.
Output strict JSON with this schema:
{
  "technicalScore": 75,
  "keywordCoverage": 70,
  "clarityScore": 85,
  "overallScore": 76,
  "feedback": "2-3 concise sentences offering actionable architectural guidance."
}`;

  const userPrompt = `Target Role: ${targetRole}\n\nCandidate Speech Transcript:\n"${transcript}"`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 4. Live AI Certificate Anti-Forgery Credibility Audit
 */
export async function auditCertificateAI(title: string, issuer: string, credentialId?: string) {
  const systemPrompt = `You are an institutional academic credential auditor.
Evaluate the stated certification title, issuing body, and credential id for authenticity and NSQF compliance.
Output strict JSON with this schema:
{
  "confidenceScore": 92,
  "status": "VERIFIED",
  "auditRationale": "Accredited syllabus matching national skill qualification frameworks."
}`;

  const userPrompt = `Certificate: ${title}\nIssuer: ${issuer}\nCredential ID: ${credentialId || 'N/A'}`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 5. AI Curriculum Diff Engine (Syllabus Re-Harmonizer)
 * Compares college course syllabus against live market recruiter postings
 */
export async function analyzeCurriculumDiffAI(syllabusText: string, domainContext = 'Engineering & Technology') {
  const systemPrompt = `You are an AICTE & UGC Curriculum Harmonization Specialist.
Analyze the provided university syllabus text against current industry corporate hiring demands for ${domainContext}.
Identify missing high-demand industry skills, outdated obsolete topics that should be pruned, compute an alignment match percentage, and formulate syllabus modernization recommendations.
Output strict JSON with this schema:
{
  "industryMatchPct": 68,
  "missingSkills": [
    { "name": "Container Orchestration (Docker/K8s)", "demandGrowth": "+45%", "importance": "CRITICAL" },
    { "name": "Vector Databases & RAG Pipelines", "demandGrowth": "+78%", "importance": "HIGH" },
    { "name": "CI/CD & Infrastructure as Code", "demandGrowth": "+38%", "importance": "HIGH" }
  ],
  "outdatedTopics": [
    { "name": "Legacy 8085 Assembly without modern RISC-V", "recommendation": "Transition to ARM Cortex-M or RISC-V architecture" },
    { "name": "SOAP XML Web Services exclusively", "recommendation": "Replace with RESTful APIs, GraphQL, and gRPC" }
  ],
  "recommendations": "2-3 concise strategic recommendations for faculty curriculum board revision."
}`;

  const userPrompt = `Domain: ${domainContext}\n\nExisting University Syllabus Text:\n"""\n${syllabusText.slice(0, 4000)}\n"""`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 6. Predictive Candidate Offer Acceptance & Retention Index
 */
export async function predictOfferAcceptanceAI(candidateData: { name: string; skills: string[]; location?: string; currentCgpa?: number }, jobOfferData: { title: string; company: string; stipend: string; location: string; requiredSkills: string[] }) {
  const systemPrompt = `You are a corporate talent acquisition predictive analytics engine.
Evaluate candidate parameters against a job offer to predict:
1. Probability of Offer Acceptance (0-100%)
2. 1-Year Retention Index (0-100)
3. Fit rationale and risk factors (travel, compensation fit, skill match).
Output strict JSON with this schema:
{
  "acceptanceProbability": 86,
  "retentionIndex": 90,
  "fitTier": "HIGH_CONFIDENCE",
  "keyDrivers": ["Strong tech stack alignment", "Competitive stipend for graduate tier"],
  "riskFactors": ["Relocation required if on-site", "High competitive demand for core skills"],
  "advisoryNote": "Candidate demonstrates 92% skill synergy; offer within 48h recommended."
}`;

  const userPrompt = `Candidate Data: ${JSON.stringify(candidateData)}\nJob Offer: ${JSON.stringify(jobOfferData)}`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 7. Fraudulent Job Posting & Scam Recruiter Detector
 */
export async function detectJobFraudAI(jobPostingData: { title: string; company: string; description: string; stipend?: string; contactEmail?: string }) {
  const systemPrompt = `You are a National Cybercrime & Employment Scam Detection AI.
Inspect the job posting for ghost companies, suspicious fee requests (e.g. paying for training or security deposits), unrealistic salary-to-skill ratios, and generic spam copy.
Output strict JSON with this schema:
{
  "riskScore": 12,
  "status": "CLEARED",
  "scamFlags": [],
  "isGhostCompany": false,
  "analysis": "Legitimate employer profile with verified corporate domain syntax."
}`;

  const userPrompt = `Job Posting: ${JSON.stringify(jobPostingData)}`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

/**
 * 8. Predictive National Skill-Shortage Early Warning System
 */
export async function forecastSkillShortageAI(domain: string) {
  const systemPrompt = `You are a NITI Aayog & AICTE National Human Resource Forecasting Engine for India.
Forecast the 1-3 year talent deficit index, risk level, projected deficit percentage, and critical policy intervention recommendations for the specified technology domain in India.
Output strict JSON with this schema:
{
  "domain": "${domain}",
  "demandIndex": 92,
  "projectedDeficitPct": 58,
  "riskLevel": "CRITICAL",
  "timeline": "2026 – 2028",
  "keySkills": "List of 4-5 emerging required competencies",
  "recommendedAction": "Government and institutional curriculum intervention mandate"
}`;

  const userPrompt = `Forecast talent supply vs industrial deficit for India in: ${domain}`;
  const result = await callLLMStructured(systemPrompt, userPrompt);
  return result;
}

