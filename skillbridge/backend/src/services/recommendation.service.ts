import { db } from '../database/db';

// ============================================================
// RECOMMENDATION ENGINE
// Deterministic algorithm with clear weights per dimension.
// Designed for easy replacement with an LLM/ML model later.
// ============================================================

interface StudentSkill {
  skill_id: string;
  skill_name: string;
  proficiency: string;
  assessment_score: number | null;
}

interface OpportunitySkill {
  skill_id: string;
  skill_name: string;
  importance: string;
}

const PROFICIENCY_WEIGHTS: Record<string, number> = {
  BEGINNER: 0.4,
  INTERMEDIATE: 0.7,
  ADVANCED: 1.0,
};

// Weights for match score calculation
const WEIGHTS = {
  requiredSkills: 0.70,
  preferredSkills: 0.15,
  proficiencyBonus: 0.10,
  assessmentBonus: 0.05,
};

export async function calculateMatchScore(studentId: string, opportunityId: string): Promise<number> {
  const [studentSkills, oppSkills] = await Promise.all([
    getStudentSkills(studentId),
    getOpportunitySkills(opportunityId),
  ]);

  return computeMatchScore(studentSkills, oppSkills);
}

function computeMatchScore(studentSkills: StudentSkill[], oppSkills: OpportunitySkill[]): number {
  if (oppSkills.length === 0) return 50; // No requirements = 50% match

  const requiredSkills = oppSkills.filter(s => s.importance === 'REQUIRED');
  const preferredSkills = oppSkills.filter(s => s.importance === 'PREFERRED');

  const studentSkillMap = new Map(studentSkills.map(s => [s.skill_id, s]));

  // Required skills score (70% weight)
  let requiredScore = 0;
  let proficiencyBonus = 0;
  let assessmentBonus = 0;

  if (requiredSkills.length > 0) {
    let matchedRequired = 0;
    let totalProficiencyBonus = 0;
    let totalAssessmentBonus = 0;

    for (const reqSkill of requiredSkills) {
      const studentSkill = studentSkillMap.get(reqSkill.skill_id);
      if (studentSkill) {
        matchedRequired++;
        const profWeight = PROFICIENCY_WEIGHTS[studentSkill.proficiency] || 0.4;
        totalProficiencyBonus += profWeight;
        if (studentSkill.assessment_score !== null) {
          totalAssessmentBonus += studentSkill.assessment_score / 100;
        } else {
          totalAssessmentBonus += 0.5; // default if no score
        }
      }
    }

    requiredScore = (matchedRequired / requiredSkills.length) * 100;
    proficiencyBonus = requiredSkills.length > 0 ? (totalProficiencyBonus / requiredSkills.length) * 100 : 0;
    assessmentBonus = requiredSkills.length > 0 ? (totalAssessmentBonus / requiredSkills.length) * 100 : 0;
  } else {
    requiredScore = 100;
  }

  // Preferred skills score (15% weight)
  let preferredScore = 0;
  if (preferredSkills.length > 0) {
    const matchedPreferred = preferredSkills.filter(s => studentSkillMap.has(s.skill_id)).length;
    preferredScore = (matchedPreferred / preferredSkills.length) * 100;
  } else {
    preferredScore = 100;
  }

  const finalScore =
    (requiredScore * WEIGHTS.requiredSkills) +
    (preferredScore * WEIGHTS.preferredSkills) +
    (proficiencyBonus * WEIGHTS.proficiencyBonus) +
    (assessmentBonus * WEIGHTS.assessmentBonus);

  return Math.min(Math.round(finalScore), 100);
}

async function getStudentSkills(userId: string): Promise<StudentSkill[]> {
  const result = await db.execute({
    sql: `SELECT us.skill_id, s.name as skill_name, us.proficiency, us.assessment_score
          FROM user_skills us
          JOIN skills s ON us.skill_id = s.id
          WHERE us.user_id = ?`,
    args: [userId],
  });
  return result.rows as unknown as StudentSkill[];
}

async function getOpportunitySkills(opportunityId: string): Promise<OpportunitySkill[]> {
  const result = await db.execute({
    sql: `SELECT os.skill_id, s.name as skill_name, os.importance
          FROM opportunity_skills os
          JOIN skills s ON os.skill_id = s.id
          WHERE os.opportunity_id = ?`,
    args: [opportunityId],
  });
  return result.rows as unknown as OpportunitySkill[];
}

// ============================================================
// SKILL GAP ANALYSIS
// ============================================================

export async function analyzeSkillGaps(studentId: string): Promise<{
  studentSkills: StudentSkill[];
  missingSkills: Array<{ skill_id: string; skill_name: string; category: string; demandCount: number }>;
  weakSkills: StudentSkill[];
  recommendations: Array<{ type: 'training' | 'opportunity'; id: string; title: string; reason: string }>;
}> {
  const studentSkills = await getStudentSkills(studentId);
  const studentSkillIds = new Set(studentSkills.map(s => s.skill_id));

  // Find skills demanded by active opportunities but missing from student
  const demandedSkills = await db.execute({
    sql: `SELECT s.id, s.name as skill_name, s.category, COUNT(os.opportunity_id) as demand_count
          FROM opportunity_skills os
          JOIN skills s ON os.skill_id = s.id
          JOIN opportunities o ON os.opportunity_id = o.id AND o.is_active = 1
          WHERE os.importance = 'REQUIRED'
          GROUP BY s.id
          ORDER BY demand_count DESC
          LIMIT 20`,
    args: [],
  });

  const missingSkills = (demandedSkills.rows as any[])
    .filter(s => !studentSkillIds.has(s.id))
    .map(s => ({ skill_id: s.id, skill_name: s.skill_name, category: s.category, demandCount: s.demand_count }));

  // Identify weak skills (BEGINNER proficiency)
  const weakSkills = studentSkills.filter(s => s.proficiency === 'BEGINNER');

  return { studentSkills, missingSkills, weakSkills, recommendations: [] };
}

// ============================================================
// FULL RECOMMENDATIONS FOR STUDENT
// ============================================================

export async function getStudentRecommendations(studentId: string) {
  const studentSkills = await getStudentSkills(studentId);
  const studentSkillIds = new Set(studentSkills.map(s => s.skill_id));

  // Get active opportunities
  const opportunities = await db.execute({
    sql: `SELECT o.id, o.title, o.type, o.location, o.duration, o.stipend, o.salary_range, o.deadline,
                 rp.company_name, u.name as recruiter_name
          FROM opportunities o
          JOIN users u ON o.recruiter_id = u.id
          LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
          WHERE o.is_active = 1
          ORDER BY o.created_at DESC`,
    args: [],
  });

  // Score each opportunity
  const scoredOpps = await Promise.all((opportunities.rows as any[]).map(async (opp) => {
    const oppSkills = await getOpportunitySkills(opp.id);
    const score = computeMatchScore(studentSkills, oppSkills);
    const requiredSkills = oppSkills.filter(s => s.importance === 'REQUIRED');
    const matchingSkills = requiredSkills.filter(s => studentSkillIds.has(s.skill_id));
    const missingSkills = requiredSkills.filter(s => !studentSkillIds.has(s.skill_id));
    return { ...opp, matchScore: score, skills: oppSkills, matchingSkills, missingSkills };
  }));

  // Sort by score
  scoredOpps.sort((a, b) => b.matchScore - a.matchScore);

  // Get skill gaps
  const gapAnalysis = await analyzeSkillGaps(studentId);

  // Recommend training programs based on missing skills
  const missingSkillIds = gapAnalysis.missingSkills.map(s => s.skill_id);
  let trainingRecommendations: any[] = [];

  if (missingSkillIds.length > 0) {
    const placeholders = missingSkillIds.map(() => '?').join(',');
    const trainings = await db.execute({
      sql: `SELECT tp.*, GROUP_CONCAT(s.name) as skill_names
            FROM training_programs tp
            JOIN training_skills ts ON ts.training_program_id = tp.id
            JOIN skills s ON ts.skill_id = s.id
            WHERE ts.skill_id IN (${placeholders}) AND tp.is_active = 1
            GROUP BY tp.id
            ORDER BY tp.level
            LIMIT 6`,
      args: missingSkillIds.slice(0, 10),
    });
    trainingRecommendations = trainings.rows as any[];
  }

  // If not enough, get general recommendations
  if (trainingRecommendations.length < 3) {
    const more = await db.execute({
      sql: 'SELECT * FROM training_programs WHERE is_active = 1 ORDER BY created_at DESC LIMIT 6',
      args: [],
    });
    const existing = new Set(trainingRecommendations.map((t: any) => t.id));
    for (const tp of more.rows as any[]) {
      if (!existing.has(tp.id)) trainingRecommendations.push(tp);
    }
  }

  return {
    opportunities: scoredOpps.slice(0, 10),
    allOpportunities: scoredOpps,
    skillGaps: gapAnalysis.missingSkills.slice(0, 8),
    weakSkills: gapAnalysis.weakSkills,
    trainingRecommendations: trainingRecommendations.slice(0, 6),
    studentSkills,
  };
}

// ============================================================
// INDUSTRY SIDE: Match students for a given opportunity
// ============================================================

export async function matchStudentsForOpportunity(opportunityId: string, limit = 10): Promise<any[]> {
  const oppSkills = await getOpportunitySkills(opportunityId);

  const students = await db.execute({
    sql: `SELECT u.id, u.name, u.email, sp.institution, sp.branch, sp.cgpa, sp.graduation_year
          FROM users u
          JOIN student_profiles sp ON sp.user_id = u.id
          WHERE u.role = 'STUDENT'`,
    args: [],
  });

  const scored = await Promise.all((students.rows as any[]).map(async (student) => {
    const skills = await getStudentSkills(student.id);
    const score = computeMatchScore(skills, oppSkills);
    return { ...student, matchScore: score, skills };
  }));

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.slice(0, limit);
}
