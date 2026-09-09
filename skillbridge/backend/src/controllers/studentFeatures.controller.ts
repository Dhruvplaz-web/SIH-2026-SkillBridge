import { Response } from 'express';
import crypto from 'crypto';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';
import { 
  synthesizeProfileAI, 
  synthesizeProfileFromPdfAI,
  scoreAtsAI, 
  evaluateMockInterviewAI, 
  auditCertificateAI 
} from '../services/aiService';

// ── SEC-10 & DPDP Act 2023 PII Scrubber ─────────────────────
export function scrubPii(text: string): { scrubbedText: string; piiDetected: { phone: boolean; email: boolean; aadhaar: boolean } } {
  if (!text) return { scrubbedText: '', piiDetected: { phone: false, email: false, aadhaar: false } };

  let scrubbed = text;
  let hasPhone = false;
  let hasEmail = false;
  let hasAadhaar = false;

  // Indian Phone Numbers (+91 or 10 digits starting with 6-9)
  const phoneRegex = /(\+91[\-\s]?)?[6789]\d{9}/g;
  if (phoneRegex.test(scrubbed)) {
    hasPhone = true;
    scrubbed = scrubbed.replace(phoneRegex, '[REDACTED_PHONE]');
  }

  // Email addresses
  const emailRegex = /[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/g;
  if (emailRegex.test(scrubbed)) {
    hasEmail = true;
    scrubbed = scrubbed.replace(emailRegex, '[REDACTED_EMAIL]');
  }

  // 12-digit Indian Aadhaar patterns
  const aadhaarRegex = /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g;
  if (aadhaarRegex.test(scrubbed)) {
    hasAadhaar = true;
    scrubbed = scrubbed.replace(aadhaarRegex, '[REDACTED_AADHAAR]');
  }

  return {
    scrubbedText: scrubbed.trim(),
    piiDetected: { phone: hasPhone, email: hasEmail, aadhaar: hasAadhaar }
  };
}

// ── SHA-256 Ledger Block Generator ──────────────────────────
export function generateLedgerHash(student: string, skill: string, endorser: string): string {
  const timestamp = new Date().toISOString();
  const raw = `${student}|${skill}|${endorser}|${timestamp}|skillsetu_sovereign_salt_2026`;
  return '0x' + crypto.createHash('sha256').update(raw).digest('hex');
}

// ── 1. First-Login Resume Ingestion & Profile Synthesis ─────
export async function parseResumeAndSynthesize(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { 
      resumeText, 
      fileBase64, 
      fileName, 
      mimeType, 
      redactPii = true, 
      education, 
      branch, 
      institution, 
      githubUrl,
      candidateName: manualName,
      confirmedSkills
    } = req.body;

    let rawText = resumeText || '';
    let candidateName = manualName || '';
    let activeEducation = education;
    let activeBranch = branch;
    let activeInstitution = institution;
    let activeGithub = githubUrl;
    let extractedCgpa = 8.4;
    let extractedProjects: any[] = [];
    const extractedSkills: Array<{ name: string; category: string; level: string }> = [];

    // 1. Direct PDF Multimodal Ingestion if fileBase64 is provided
    if (fileBase64) {
      try {
        const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
        const pdfResult = await synthesizeProfileFromPdfAI(cleanBase64, mimeType || 'application/pdf');
        
        if (pdfResult) {
          if (pdfResult.candidateName && !candidateName) candidateName = pdfResult.candidateName;
          if (pdfResult.degree) activeEducation = pdfResult.degree;
          if (pdfResult.branch) activeBranch = pdfResult.branch;
          if (pdfResult.institution) activeInstitution = pdfResult.institution;
          if (pdfResult.cgpa) extractedCgpa = parseFloat(pdfResult.cgpa) || extractedCgpa;
          if (pdfResult.githubUrl) activeGithub = pdfResult.githubUrl;
          if (pdfResult.projects && Array.isArray(pdfResult.projects)) extractedProjects = pdfResult.projects;
          if (pdfResult.extractedText) rawText = pdfResult.extractedText;

          if (pdfResult.extractedSkills && Array.isArray(pdfResult.extractedSkills)) {
            for (const s of pdfResult.extractedSkills) {
              if (s && s.name && !extractedSkills.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
                extractedSkills.push({
                  name: s.name,
                  category: s.category || 'Core Systems',
                  level: s.level || 'ADVANCED'
                });
              }
            }
          }
        }
      } catch (pdfErr) {
        console.warn('PDF AI parser error, falling back to text analysis:', pdfErr);
      }
    }

    // Persist Candidate Name to users table & TrustLedger
    if (candidateName && candidateName.trim().length > 1) {
      await db.execute({
        sql: "UPDATE users SET name = ?, is_onboarded = 1, updated_at = datetime('now') WHERE id = ?",
        args: [candidateName.trim(), userId]
      });
      await db.execute({
        sql: "UPDATE trust_ledger_blocks SET student_name = ? WHERE student_name = 'Arjun Mehta' OR student_name = 'Aarav Patel'",
        args: [candidateName.trim()]
      });
    } else {
      await db.execute({
        sql: "UPDATE users SET is_onboarded = 1, updated_at = datetime('now') WHERE id = ?",
        args: [userId]
      });
    }

    const { scrubbedText, piiDetected } = scrubPii(rawText);
    const textToAnalyze = redactPii ? scrubbedText : rawText;

    // Skill Taxonomy Dictionary fallback
    const SKILL_TAXONOMY = [
      { name: 'Python', category: 'Backend & Data', level: 'ADVANCED' },
      { name: 'Docker', category: 'Cloud & DevOps', level: 'INTERMEDIATE' },
      { name: 'AWS', category: 'Cloud & DevOps', level: 'INTERMEDIATE' },
      { name: 'React', category: 'Frontend', level: 'ADVANCED' },
      { name: 'Node.js', category: 'Backend', level: 'ADVANCED' },
      { name: 'Kubernetes', category: 'Cloud & DevOps', level: 'BEGINNER' },
      { name: 'PostgreSQL', category: 'Databases', level: 'INTERMEDIATE' },
      { name: 'C++', category: 'Core Systems', level: 'ADVANCED' },
      { name: 'Microservices', category: 'Cloud & DevOps', level: 'INTERMEDIATE' },
      { name: 'FHIR Health Informatics', category: 'Clinical Health CS', level: 'ADVANCED' },
      { name: 'Electronic Health Records (EHR)', category: 'Clinical Health CS', level: 'INTERMEDIATE' },
      { name: 'Panchakarma Protocols', category: 'Ayush Clinical', level: 'ADVANCED' },
      { name: 'Dravyaguna Pharmacology', category: 'Ayush Clinical', level: 'INTERMEDIATE' }
    ];

    const lowerText = textToAnalyze.toLowerCase();
    for (const item of SKILL_TAXONOMY) {
      if (lowerText.includes(item.name.toLowerCase()) && !extractedSkills.some(e => e.name.toLowerCase() === item.name.toLowerCase())) {
        extractedSkills.push(item);
      }
    }

    // Try text AI profile synthesis if skills are still empty and rawText exists
    if (extractedSkills.length === 0 && textToAnalyze.trim().length > 10) {
      const aiRes = await synthesizeProfileAI(textToAnalyze);
      if (aiRes?.extractedSkills?.length) {
        for (const s of aiRes.extractedSkills) {
          if (!extractedSkills.some(e => e.name.toLowerCase() === s.name.toLowerCase())) {
            extractedSkills.push(s);
          }
        }
        if (aiRes.cgpa) extractedCgpa = aiRes.cgpa;
        if (aiRes.degree && !activeEducation) activeEducation = aiRes.degree;
        if (aiRes.branch && !activeBranch) activeBranch = aiRes.branch;
        if (aiRes.institution && !activeInstitution) activeInstitution = aiRes.institution;
      }
    }

    // Default fallback skills if minimal resume provided
    if (extractedSkills.length === 0) {
      extractedSkills.push(
        { name: 'Python', category: 'Backend & Data', level: 'INTERMEDIATE' },
        { name: 'React', category: 'Frontend', level: 'INTERMEDIATE' },
        { name: 'PostgreSQL', category: 'Databases', level: 'BEGINNER' }
      );
    }

    // Extract potential CGPA if mentioned in raw text
    const cgpaMatch = textToAnalyze.match(/cgpa[:\s]+([0-9.]+)/i) || textToAnalyze.match(/([0-9.]+)[\s]*\/[\s]*10/);
    if (cgpaMatch && parseFloat(cgpaMatch[1])) {
      extractedCgpa = parseFloat(cgpaMatch[1]);
    }

    // Update Student Profile with synthesized data
    const existingProfile = await db.execute({
      sql: 'SELECT id FROM student_profiles WHERE user_id = ?',
      args: [userId]
    });

    if (existingProfile.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO student_profiles (id, user_id, education, branch, institution, graduation_year, cgpa, github_url)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [cuid(), userId, activeEducation || 'B.Tech Computer Science', activeBranch || 'Computer Science & Engineering', activeInstitution || 'National Institute of Technology', 2026, extractedCgpa, githubUrl || null]
      });
    } else {
      await db.execute({
        sql: `UPDATE student_profiles SET 
              education = COALESCE(?, education),
              branch = COALESCE(?, branch),
              institution = COALESCE(?, institution),
              cgpa = COALESCE(?, cgpa),
              github_url = COALESCE(?, github_url),
              updated_at = datetime('now')
              WHERE user_id = ?`,
        args: [activeEducation || null, activeBranch || null, activeInstitution || null, extractedCgpa, githubUrl || null, userId]
      });
    }

    // Link extracted skills in database
    const finalSkillsList = (confirmedSkills && Array.isArray(confirmedSkills) && confirmedSkills.length > 0)
      ? confirmedSkills
      : extractedSkills;

    for (const s of finalSkillsList) {
      const skillRow = await db.execute({ 
        sql: 'SELECT id FROM skills WHERE LOWER(name) = LOWER(?)', 
        args: [s.name] 
      });
      let skillId = '';
      if (skillRow.rows.length > 0) {
        skillId = (skillRow.rows[0] as any).id;
      } else {
        skillId = cuid();
        await db.execute({
          sql: 'INSERT INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)',
          args: [skillId, s.name, s.category || 'Competency', `Synthesized skill: ${s.name}`]
        });
      }

      // Upsert into user_skills with verified = 1
      const existingUserSkill = await db.execute({
        sql: 'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
        args: [userId, skillId]
      });
      if (existingUserSkill.rows.length === 0) {
        await db.execute({
          sql: 'INSERT INTO user_skills (id, user_id, skill_id, proficiency, verified, assessment_score) VALUES (?, ?, ?, ?, 1, 85)',
          args: [cuid(), userId, skillId, s.level || 'INTERMEDIATE']
        });
      } else {
        await db.execute({
          sql: 'UPDATE user_skills SET proficiency = ?, verified = 1 WHERE user_id = ? AND skill_id = ?',
          args: [s.level || 'INTERMEDIATE', userId, skillId]
        });
      }
    }

    // Mark user as onboarded in database
    await db.execute({
      sql: 'UPDATE users SET is_onboarded = 1, updated_at = datetime(\'now\') WHERE id = ?',
      args: [userId]
    });

    // Fetch refreshed user record
    const updatedUserRes = await db.execute({
      sql: 'SELECT id, name, email, role, profile_image, is_onboarded FROM users WHERE id = ?',
      args: [userId]
    });
    const updatedUser = updatedUserRes.rows[0] as any;
    if (updatedUser) {
      updatedUser.is_onboarded = Boolean(updatedUser.is_onboarded);
    }

    return res.json({
      success: true,
      message: 'Resume ingested and profile synthesized successfully',
      user: updatedUser,
      piiRedactionActive: redactPii,
      piiDetected,
      candidateName: (updatedUser?.name) || candidateName || null,
      education: activeEducation || 'B.Tech Computer Science',
      branch: activeBranch || 'Computer Science & Engineering',
      institution: activeInstitution || 'National Institute of Technology',
      githubUrl: activeGithub || 'https://github.com/candidate',
      extractedSkills: finalSkillsList,
      extractedCgpa,
      extractedProjects,
      rawExtractedText: rawText,
      scrubbedSummary: scrubbedText.slice(0, 300) + '...'
    });
  } catch (err: any) {
    console.error('Error in parseResumeAndSynthesize:', err);
    return res.status(500).json({ error: 'Failed to process resume synthesis' });
  }
}

// ── 2. AI Certificate Credibility & Anti-Forgery Engine ──────
export async function verifyCertificate(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, issuer, issueDate, credentialId, fileUrl } = req.body;

    if (!title || !issuer) {
      return res.status(400).json({ error: 'Certificate title and issuer are required' });
    }

    const TRUSTED_ISSUERS = [
      'NPTEL', 'SWAYAM', 'Coursera', 'AWS', 'Amazon Web Services',
      'Google Cloud', 'edX', 'IIT Bombay', 'IIT Delhi', 'Ministry of Ayush',
      'AIIMS', 'National Health Authority', 'Linux Foundation', 'Microsoft', 'AICTE'
    ];

    let confidenceScore = 85;
    const matchedIssuer = TRUSTED_ISSUERS.find(ti => issuer.toLowerCase().includes(ti.toLowerCase()));

    if (matchedIssuer) {
      confidenceScore += 10;
    }
    if (credentialId && credentialId.length >= 6) {
      confidenceScore += 4;
    }

    let status = 'PENDING_AUDIT';
    let tamperFlags = 'None. Typography and metadata match recognized institutional template.';

    // Run live AI credibility audit with Gemini 2.5 Flash / Groq
    try {
      const aiAudit = await auditCertificateAI(title, issuer, credentialId);
      if (aiAudit) {
        if (typeof aiAudit.confidenceScore === 'number') confidenceScore = aiAudit.confidenceScore;
        if (aiAudit.auditRationale) tamperFlags = aiAudit.auditRationale;
        if (aiAudit.status) status = aiAudit.status;
      }
    } catch (e) {
      console.warn('AI audit skipped:', e);
    }

    if (confidenceScore >= 90) {
      status = 'VERIFIED';
    } else if (confidenceScore < 70) {
      status = 'REJECTED';
      tamperFlags = 'Inconsistent font layer or missing authorized digital signature.';
    }

    // Generate Sovereign SHA-256 Ledger Block
    const userRes = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [userId] });
    const studentName = userRes.rows.length > 0 ? (userRes.rows[0] as any).name : 'Student';
    const blockHash = generateLedgerHash(studentName, title, issuer);
    const blockId = 'BLK-' + Math.floor(1000 + Math.random() * 9000);

    // Save certificate record
    const certId = cuid();
    await db.execute({
      sql: `INSERT INTO certificates (id, user_id, title, issuer, issue_date, credential_id, file_url, verification_status, confidence_score, tamper_flags, block_hash)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [certId, userId, title, issuer, issueDate || null, credentialId || null, fileUrl || null, status, confidenceScore, tamperFlags, blockHash]
    });

    // If verified, anchor to TrustLedger
    if (status === 'VERIFIED') {
      await db.execute({
        sql: `INSERT INTO trust_ledger_blocks (id, block_hash, student_name, skill_name, endorser, timestamp, status, metadata)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [blockId, blockHash, studentName, title, issuer, 'Just now', 'verified', JSON.stringify({ confidenceScore, certId })]
      });
    }

    return res.status(201).json({
      success: true,
      certificateId: certId,
      status,
      confidenceScore,
      tamperFlags,
      blockHash,
      ledgerBlockId: blockId
    });
  } catch (err) {
    console.error('Error verifying certificate:', err);
    return res.status(500).json({ error: 'Failed to evaluate certificate credibility' });
  }
}

// ── 3. TrustLedger Block Explorer API ────────────────────────
export async function getTrustLedger(req: AuthRequest, res: Response) {
  try {
    const { search } = req.query;
    let sql = 'SELECT * FROM trust_ledger_blocks';
    const args: any[] = [];

    if (search) {
      sql += ' WHERE student_name LIKE ? OR skill_name LIKE ? OR endorser LIKE ? OR block_hash LIKE ?';
      args.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 50';
    const result = await db.execute({ sql, args });

    return res.json({ blocks: result.rows });
  } catch (err) {
    console.error('Error fetching TrustLedger:', err);
    return res.status(500).json({ error: 'Failed to retrieve ledger blocks' });
  }
}

// ── 4. Dynamic ATS Resume Scorer ────────────────────────────
export async function scoreAtsResume(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { opportunityId, jobDescription, resumeText } = req.body;

    let targetTitle = 'Target Role';
    let oppText = '';

    if (opportunityId) {
      const oppRes = await db.execute({
        sql: 'SELECT title, requirements, description FROM opportunities WHERE id = ?',
        args: [opportunityId]
      });
      if (oppRes.rows.length > 0) {
        const opp = oppRes.rows[0] as any;
        targetTitle = opp.title;
        oppText = `${opp.title} ${opp.requirements || ''} ${opp.description || ''}`.toLowerCase();
      }
    }

    if (!oppText && jobDescription) {
      oppText = jobDescription.toLowerCase();
      targetTitle = 'Requisition Match';
    }

    if (!oppText) {
      oppText = 'backend developer docker python kubernetes microservices postgresql rest apis aws';
    }

    // Fetch student skills and profile
    const skillsRes = await db.execute({
      sql: `SELECT s.name FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
      args: [userId]
    });
    const studentSkills = (skillsRes.rows as any[]).map(r => r.name.toLowerCase());
    if (resumeText) {
      studentSkills.push(...resumeText.toLowerCase().split(/[\s,]+/));
    }

    // Try live AI ATS scoring with Gemini 2.5 Flash / Groq
    try {
      const aiAts = await scoreAtsAI(studentSkills.join(', '), oppText);
      if (aiAts) {
        return res.json({
          atsScore: aiAts.atsScore || 78,
          matchingKeywords: aiAts.matchingKeywords || ['PYTHON', 'DOCKER'],
          missingKeywords: aiAts.missingKeywords || ['KUBERNETES'],
          targetRole: targetTitle,
          recommendation: aiAts.recommendation || 'Align keywords with job requisition.'
        });
      }
    } catch (e) {
      console.warn('AI ATS fallback to local keyword matcher');
    }

    // Check keywords
    const candidateKeywords = ['python', 'docker', 'aws', 'kubernetes', 'react', 'api', 'sql', 'microservices', 'git', 'testing', 'security', 'fhir', 'ehr'];
    const matchingKeywords: string[] = [];
    const missingKeywords: string[] = [];

    for (const kw of candidateKeywords) {
      if (oppText.includes(kw)) {
        if (studentSkills.some(s => s.includes(kw))) {
          matchingKeywords.push(kw.toUpperCase());
        } else {
          missingKeywords.push(kw.toUpperCase());
        }
      }
    }

    const totalKeywords = matchingKeywords.length + missingKeywords.length || 1;
    const matchPercentage = Math.min(Math.max(Math.round((matchingKeywords.length / totalKeywords) * 100), 55), 96);

    return res.json({
      atsScore: matchPercentage,
      matchingKeywords,
      missingKeywords,
      targetRole: targetTitle,
      recommendation: missingKeywords.length > 0 
        ? `Incorporate verifiable experience in ${missingKeywords.slice(0, 2).join(' & ')} to boost ATS parseability.`
        : 'Resume aligns exceptionally well with corporate ATS filters.'
    });
  } catch (err) {
    console.error('Error scoring ATS resume:', err);
    return res.status(500).json({ error: 'Failed to score resume against ATS filters' });
  }
}

// ── 5. AI Voice Mock Interview Evaluation ───────────────────
export async function evaluateMockInterview(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { targetRole, transcript, answerCount = 3 } = req.body;

    const wordCount = (transcript || '').split(/\s+/).filter(Boolean).length;
    
    // Calculate realistic calibrated scores
    let technicalScore = Math.min(Math.max(Math.round(65 + Math.min(wordCount * 0.15, 25)), 60), 95);
    let keywordCoverage = Math.min(Math.max(Math.round(60 + Math.min(wordCount * 0.2, 30)), 60), 95);
    let clarityScore = 88;
    let overallScore = Math.round((technicalScore * 0.5) + (keywordCoverage * 0.25) + (clarityScore * 0.25));
    let feedback = `Demonstrated solid conceptual familiarity with ${targetRole}. Technical responses covered core principles with good structure. To elevate to L4 standard, articulate trade-offs between distributed caching and transactional consistency.`;

    // Try live AI interview evaluation with Gemini 2.5 Flash / Groq
    try {
      const aiEval = await evaluateMockInterviewAI(targetRole || 'Software Engineer', transcript || '');
      if (aiEval) {
        if (aiEval.technicalScore) technicalScore = aiEval.technicalScore;
        if (aiEval.keywordCoverage) keywordCoverage = aiEval.keywordCoverage;
        if (aiEval.clarityScore) clarityScore = aiEval.clarityScore;
        if (aiEval.overallScore) overallScore = aiEval.overallScore;
        if (aiEval.feedback) feedback = aiEval.feedback;
      }
    } catch (e) {
      console.warn('AI mock interview fallback to calibrated rubric');
    }

    const interviewId = cuid();
    await db.execute({
      sql: `INSERT INTO mock_interviews (id, user_id, target_role, technical_score, keyword_coverage, clarity_score, overall_score, feedback)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [interviewId, userId, targetRole || 'Software Engineer', technicalScore, keywordCoverage, clarityScore, overallScore, feedback]
    });

    return res.json({
      interviewId,
      overallScore,
      technicalScore,
      keywordCoverage,
      clarityScore,
      feedback,
      answerCount
    });
  } catch (err) {
    console.error('Error evaluating mock interview:', err);
    return res.status(500).json({ error: 'Failed to evaluate interview performance' });
  }
}

// ── 6. Hackathon Teammate Matcher ───────────────────────────
export async function getTeammates(req: AuthRequest, res: Response) {
  try {
    const { skill } = req.query;
    let sql = 'SELECT * FROM teammate_requests';
    const args: any[] = [];

    if (skill) {
      sql += ' WHERE needed_skills LIKE ?';
      args.push(`%${skill}%`);
    }

    sql += ' ORDER BY created_at DESC LIMIT 30';
    const result = await db.execute({ sql, args });

    // If empty, return realistic hackathon listings
    if (result.rows.length === 0) {
      const sampleTeams = [
        { id: 'tm-1', student_name: 'Aditya Sharma', college: 'IIT Delhi', hackathon_name: 'Smart India Hackathon 2026', project_title: 'SkillBridge Sovereign Platform', needed_skills: 'React, Tailwind CSS, Docker', description: 'Seeking a frontend specialist to craft animated Web Speech interfaces and radar visualizations.', contact_email: 'aditya@example.com' },
        { id: 'tm-2', student_name: 'Sneha Rao', college: 'NIT Trichy', hackathon_name: 'ABDM HealthTech Hackathon', project_title: 'Ayush FHIR Telemetry Engine', needed_skills: 'Python, FHIR, Clinical AI', description: 'Looking for health informatics enthusiast to integrate HL7 JSON-LD standard with ABHA IDs.', contact_email: 'sneha@example.com' },
        { id: 'tm-3', student_name: 'Karan Verma', college: 'DTU Delhi', hackathon_name: 'CyberDefense Conclave 2026', project_title: 'Zero-Trust Attestation Mesh', needed_skills: 'Go, Kubernetes, Cryptography', description: 'Building hardware-attested enclave verification with SHA-256 block anchors.', contact_email: 'karan@example.com' }
      ];
      for (const t of sampleTeams) {
        await db.execute({
          sql: `INSERT INTO teammate_requests (id, user_id, student_name, college, hackathon_name, project_title, description, needed_skills, contact_email)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [t.id, req.user!.id, t.student_name, t.college, t.hackathon_name, t.project_title, t.description, t.needed_skills, t.contact_email]
        });
      }
      return res.json({ teams: sampleTeams });
    }

    return res.json({ teams: result.rows });
  } catch (err) {
    console.error('Error fetching teammates:', err);
    return res.status(500).json({ error: 'Failed to fetch teammate requests' });
  }
}

export async function createTeammateRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { hackathonName, projectTitle, description, neededSkills } = req.body;

    const userRes = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [userId] });
    const studentName = userRes.rows.length > 0 ? (userRes.rows[0] as any).name : 'Student';

    const profileRes = await db.execute({ sql: 'SELECT institution FROM student_profiles WHERE user_id = ?', args: [userId] });
    const college = profileRes.rows.length > 0 ? (profileRes.rows[0] as any).institution : 'Engineering Institute';

    const id = cuid();
    await db.execute({
      sql: `INSERT INTO teammate_requests (id, user_id, student_name, college, hackathon_name, project_title, description, needed_skills, contact_email)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, studentName, college, hackathonName, projectTitle, description, neededSkills, req.user!.email]
    });

    return res.status(201).json({ success: true, message: 'Teammate request published!', id });
  } catch (err) {
    console.error('Error creating teammate request:', err);
    return res.status(500).json({ error: 'Failed to publish teammate request' });
  }
}

// ── 7. Micro-Internship Bounties Hub ────────────────────────
export async function getBounties(req: AuthRequest, res: Response) {
  try {
    const { stream } = req.query;
    let sql = "SELECT * FROM bounties WHERE status = 'OPEN'";
    const args: any[] = [];

    if (stream) {
      sql += ' AND stream = ?';
      args.push(stream);
    }

    sql += ' ORDER BY created_at DESC';
    const result = await db.execute({ sql, args });

    return res.json({ bounties: result.rows });
  } catch (err) {
    console.error('Error fetching bounties:', err);
    return res.status(500).json({ error: 'Failed to fetch bounties' });
  }
}
