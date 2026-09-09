import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';

export async function getAdminAnalytics(req: AuthRequest, res: Response) {
  try {
    const [users, opportunities, applications, skills, enrollments, placements] = await Promise.all([
      db.execute({ sql: "SELECT role, COUNT(*) as count FROM users GROUP BY role", args: [] }),
      db.execute({ sql: "SELECT type, COUNT(*) as count FROM opportunities GROUP BY type", args: [] }),
      db.execute({ sql: "SELECT status, COUNT(*) as count FROM applications GROUP BY status", args: [] }),
      db.execute({
        sql: `SELECT s.name, COUNT(us.user_id) as student_count
              FROM skills s
              LEFT JOIN user_skills us ON us.skill_id = s.id
              GROUP BY s.id
              ORDER BY student_count DESC
              LIMIT 10`,
        args: [],
      }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM enrollments WHERE completed = 1", args: [] }),
      db.execute({ sql: "SELECT COUNT(*) as count FROM applications WHERE status = 'SELECTED'", args: [] }),
    ]);

    const userMap: Record<string, number> = {};
    for (const row of users.rows as any[]) userMap[row.role] = Number(row.count);

    const oppMap: Record<string, number> = {};
    for (const row of opportunities.rows as any[]) oppMap[row.type] = Number(row.count);

    const appMap: Record<string, number> = {};
    for (const row of applications.rows as any[]) appMap[row.status] = Number(row.count);

    const totalApplications = Object.values(appMap).reduce((a, b) => a + b, 0);
    const totalOpportunities = Object.values(oppMap).reduce((a, b) => a + b, 0);
    const totalUsers = Object.values(userMap).reduce((a, b) => a + b, 0);

    // Most demanded skills (from opportunity requirements)
    const demandedSkills = await db.execute({
      sql: `SELECT s.name, COUNT(os.opportunity_id) as demand_count
            FROM opportunity_skills os
            JOIN skills s ON os.skill_id = s.id
            JOIN opportunities o ON os.opportunity_id = o.id AND o.is_active = 1
            WHERE os.importance = 'REQUIRED'
            GROUP BY s.id
            ORDER BY demand_count DESC
            LIMIT 10`,
      args: [],
    });

    // Common skill gaps (skills demanded but few students have)
    const skillGaps = await db.execute({
      sql: `SELECT s.name, 
                   COUNT(DISTINCT os.opportunity_id) as demand,
                   COUNT(DISTINCT us.user_id) as supply,
                   (COUNT(DISTINCT os.opportunity_id) - COUNT(DISTINCT us.user_id)) as gap
            FROM skills s
            JOIN opportunity_skills os ON os.skill_id = s.id
            LEFT JOIN user_skills us ON us.skill_id = s.id
            GROUP BY s.id
            ORDER BY gap DESC
            LIMIT 8`,
      args: [],
    });

    // User growth (last 6 months)
    const userGrowth = await db.execute({
      sql: `SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
            FROM users
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6`,
      args: [],
    });

    // Application trends
    const appTrends = await db.execute({
      sql: `SELECT strftime('%Y-%m', applied_at) as month, COUNT(*) as count
            FROM applications
            GROUP BY month
            ORDER BY month DESC
            LIMIT 6`,
      args: [],
    });

    return res.json({
      summary: {
        totalUsers,
        students: userMap['STUDENT'] || 0,
        academicians: userMap['ACADEMICIAN'] || 0,
        recruiters: userMap['RECRUITER'] || 0,
        admins: userMap['ADMIN'] || 0,
        totalOpportunities,
        internships: oppMap['INTERNSHIP'] || 0,
        jobs: oppMap['JOB'] || 0,
        training: oppMap['TRAINING'] || 0,
        totalApplications,
        placements: (placements.rows[0] as any).count,
        completedTrainings: (enrollments.rows[0] as any).count,
      },
      applicationsByStatus: appMap,
      topSkills: skills.rows,
      demandedSkills: demandedSkills.rows,
      skillGaps: skillGaps.rows,
      userGrowth: userGrowth.rows.reverse(),
      appTrends: appTrends.rows.reverse(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get analytics' });
  }
}

export async function getStudentAnalytics(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const [skills, assessments, applications, enrollments] = await Promise.all([
      db.execute({
        sql: `SELECT s.name, s.category, us.proficiency, us.assessment_score
              FROM user_skills us
              JOIN skills s ON us.skill_id = s.id
              WHERE us.user_id = ?
              ORDER BY s.category`,
        args: [userId],
      }),
      db.execute({
        sql: `SELECT ar.percentage, ar.proficiency, ar.completed_at, a.title, a.category
              FROM assessment_results ar
              JOIN assessments a ON ar.assessment_id = a.id
              WHERE ar.user_id = ?
              ORDER BY ar.completed_at`,
        args: [userId],
      }),
      db.execute({
        sql: `SELECT status, COUNT(*) as count FROM applications WHERE student_id = ? GROUP BY status`,
        args: [userId],
      }),
      db.execute({
        sql: `SELECT e.progress, e.completed, tp.title, tp.category
              FROM enrollments e
              JOIN training_programs tp ON e.training_program_id = tp.id
              WHERE e.student_id = ?`,
        args: [userId],
      }),
    ]);

    const appMap: Record<string, number> = {};
    for (const row of applications.rows as any[]) appMap[row.status] = Number(row.count);

    const proficiencyDist: Record<string, number> = { BEGINNER: 0, INTERMEDIATE: 0, ADVANCED: 0 };
    for (const row of skills.rows as any[]) {
      proficiencyDist[row.proficiency] = (proficiencyDist[row.proficiency] || 0) + 1;
    }

    return res.json({
      skills: skills.rows,
      proficiencyDistribution: proficiencyDist,
      assessmentHistory: assessments.rows,
      applicationStats: appMap,
      enrollments: enrollments.rows,
      totalSkills: skills.rows.length,
      totalAssessments: assessments.rows.length,
      totalApplications: Object.values(appMap).reduce((a, b) => a + b, 0),
      completedTrainings: (enrollments.rows as any[]).filter((e: any) => e.completed).length,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get analytics' });
  }
}

export async function getRecruiterAnalytics(req: AuthRequest, res: Response) {
  try {
    const recruiterId = req.user!.id;

    const [opportunities, applications, topSkills] = await Promise.all([
      db.execute({
        sql: `SELECT o.id, o.title, o.type, o.is_active,
                     COUNT(a.id) as application_count,
                     AVG(a.match_score) as avg_match_score
              FROM opportunities o
              LEFT JOIN applications a ON a.opportunity_id = o.id
              WHERE o.recruiter_id = ?
              GROUP BY o.id
              ORDER BY application_count DESC`,
        args: [recruiterId],
      }),
      db.execute({
        sql: `SELECT a.status, COUNT(*) as count
              FROM applications a
              JOIN opportunities o ON a.opportunity_id = o.id
              WHERE o.recruiter_id = ?
              GROUP BY a.status`,
        args: [recruiterId],
      }),
      db.execute({
        sql: `SELECT s.name, COUNT(DISTINCT us.user_id) as student_count
              FROM opportunity_skills os
              JOIN opportunities o ON os.opportunity_id = o.id AND o.recruiter_id = ?
              JOIN skills s ON os.skill_id = s.id
              LEFT JOIN user_skills us ON us.skill_id = s.id
              GROUP BY s.id
              ORDER BY student_count DESC
              LIMIT 8`,
        args: [recruiterId],
      }),
    ]);

    const appMap: Record<string, number> = {};
    for (const row of applications.rows as any[]) appMap[row.status] = Number(row.count);
    const totalApps = Object.values(appMap).reduce((a, b) => a + b, 0);

    // Match score distribution
    const matchScores = await db.execute({
      sql: `SELECT 
              CASE 
                WHEN match_score >= 80 THEN 'Excellent (80-100%)'
                WHEN match_score >= 60 THEN 'Good (60-79%)'
                WHEN match_score >= 40 THEN 'Fair (40-59%)'
                ELSE 'Low (<40%)'
              END as range,
              COUNT(*) as count
            FROM applications a
            JOIN opportunities o ON a.opportunity_id = o.id
            WHERE o.recruiter_id = ?
            GROUP BY range`,
      args: [recruiterId],
    });

    return res.json({
      opportunities: opportunities.rows,
      applicationsByStatus: appMap,
      totalApplications: totalApps,
      topSkills: topSkills.rows,
      matchScoreDistribution: matchScores.rows,
      activeOpportunities: (opportunities.rows as any[]).filter((o: any) => o.is_active).length,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get recruiter analytics' });
  }
}

export async function getAcademicianAnalytics(req: AuthRequest, res: Response) {
  try {
    // Common skill gaps across all students
    const skillGaps = await db.execute({
      sql: `SELECT s.name, s.category,
                   COUNT(DISTINCT os.opportunity_id) as demand,
                   COUNT(DISTINCT us.user_id) as student_supply,
                   (SELECT COUNT(*) FROM users WHERE role = 'STUDENT') as total_students
            FROM skills s
            LEFT JOIN opportunity_skills os ON os.skill_id = s.id
            LEFT JOIN user_skills us ON us.skill_id = s.id AND us.proficiency IN ('INTERMEDIATE', 'ADVANCED')
            GROUP BY s.id
            ORDER BY demand DESC
            LIMIT 10`,
      args: [],
    });

    // Student progress
    const studentProgress = await db.execute({
      sql: `SELECT AVG(sp.profile_completion) as avg_completion,
                   COUNT(DISTINCT e.student_id) as enrolled_students,
                   COUNT(CASE WHEN e.completed = 1 THEN 1 END) as completed_trainings
            FROM student_profiles sp
            LEFT JOIN enrollments e ON e.student_id = sp.user_id`,
      args: [],
    });

    // Popular skills
    const popularSkills = await db.execute({
      sql: `SELECT s.name, s.category, COUNT(us.user_id) as student_count,
                   COUNT(CASE WHEN us.proficiency = 'ADVANCED' THEN 1 END) as advanced_count
            FROM skills s
            JOIN user_skills us ON us.skill_id = s.id
            GROUP BY s.id
            ORDER BY student_count DESC
            LIMIT 10`,
      args: [],
    });

    // Training participation
    const trainingStats = await db.execute({
      sql: `SELECT tp.title, tp.category, COUNT(e.student_id) as enrollments,
                   AVG(e.progress) as avg_progress
            FROM training_programs tp
            LEFT JOIN enrollments e ON e.training_program_id = tp.id
            GROUP BY tp.id
            ORDER BY enrollments DESC`,
      args: [],
    });

    const studentCount = await db.execute({ sql: "SELECT COUNT(*) as count FROM users WHERE role = 'STUDENT'", args: [] });

    return res.json({
      skillGaps: skillGaps.rows,
      studentProgress: studentProgress.rows[0],
      popularSkills: popularSkills.rows,
      trainingStats: trainingStats.rows,
      totalStudents: (studentCount.rows[0] as any).count,
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get analytics' });
  }
}
