import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';
import { calculateMatchScore } from '../services/recommendation.service';

export async function applyForOpportunity(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;
    const { opportunityId, coverLetter, resumeUrl, resumeFilename } = req.body;

    if (!opportunityId) {
      return res.status(400).json({ error: 'Opportunity ID required' });
    }

    // Check opportunity exists
    const oppCheck = await db.execute({
      sql: 'SELECT id, title, recruiter_id FROM opportunities WHERE id = ? AND is_active = 1',
      args: [opportunityId],
    });
    if (oppCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Opportunity not found or no longer active' });
    }

    // Check for duplicate application
    const dupCheck = await db.execute({
      sql: 'SELECT id FROM applications WHERE student_id = ? AND opportunity_id = ?',
      args: [studentId, opportunityId],
    });
    if (dupCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Already applied for this opportunity' });
    }

    // Calculate match score
    const matchScore = await calculateMatchScore(studentId, opportunityId);

    const appId = cuid();
    await db.execute({
      sql: 'INSERT INTO applications (id, student_id, opportunity_id, match_score, status, cover_letter, resume_url, resume_filename) VALUES (?, ?, ?, ?, \'APPLIED\', ?, ?, ?)',
      args: [appId, studentId, opportunityId, matchScore, coverLetter || '', resumeUrl || null, resumeFilename || null],
    });

    const opp = oppCheck.rows[0] as any;

    // Notify recruiter
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), opp.recruiter_id, `New application received for "${opp.title}" (${Math.round(matchScore)}% match)`, 'INFO'],
    });

    // Notify student
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), studentId, `Successfully applied for "${opp.title}"`, 'SUCCESS'],
    });

    return res.status(201).json({
      message: 'Application submitted successfully',
      id: appId,
      matchScore: Math.round(matchScore),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to submit application' });
  }
}

export async function getStudentApplications(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;

    const result = await db.execute({
      sql: `SELECT a.*, 
                   o.title, o.type, o.location, o.duration, o.stipend, o.salary_range,
                   rp.company_name,
                   u.name as recruiter_name
            FROM applications a
            JOIN opportunities o ON a.opportunity_id = o.id
            JOIN users u ON o.recruiter_id = u.id
            LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
            WHERE a.student_id = ?
            ORDER BY a.applied_at DESC`,
      args: [studentId],
    });

    return res.json({ applications: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get applications' });
  }
}

export async function getOpportunityApplications(req: AuthRequest, res: Response) {
  try {
    const { opportunityId } = req.params;
    const recruiterId = req.user!.id;

    // Verify recruiter owns this opportunity
    const oppCheck = await db.execute({
      sql: 'SELECT id FROM opportunities WHERE id = ? AND recruiter_id = ?',
      args: [opportunityId, recruiterId],
    });
    if (oppCheck.rows.length === 0 && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const result = await db.execute({
      sql: `SELECT a.*,
                   u.name as student_name,
                   u.email as student_email,
                   sp.institution, sp.branch, sp.education, sp.cgpa, sp.graduation_year
            FROM applications a
            JOIN users u ON a.student_id = u.id
            LEFT JOIN student_profiles sp ON sp.user_id = u.id
            WHERE a.opportunity_id = ?
            ORDER BY a.match_score DESC, a.applied_at ASC`,
      args: [opportunityId],
    });

    const isBlind = req.query.blind === 'true' || req.query.blind === '1';

    // Get skills for each student
    const apps = await Promise.all((result.rows as any[]).map(async (app) => {
      const skills = await db.execute({
        sql: `SELECT us.proficiency, s.name, s.category FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = ?`,
        args: [app.student_id],
      });

      // Production BMS (Blind Merit System) Field Masking
      if (isBlind && app.status !== 'SELECTED') {
        const hashId = (app.id || '').slice(-4).toUpperCase() || '7A9B';
        return {
          ...app,
          student_name: `Scholar #CAND-${hashId}`,
          student_email: `scholar.${hashId.toLowerCase()}@blind.skillbridge.gov.in`,
          institution: 'Accredited Technical Institute [BMS Blinded]',
          branch: app.branch || 'Engineering / Applied Sciences',
          cgpa: null,
          bms_masked: true,
          skills: skills.rows,
        };
      }

      return { ...app, bms_masked: false, skills: skills.rows };
    }));

    return res.json({ applications: apps, bmsActive: isBlind });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get applications' });
  }
}

export async function updateApplicationStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED', 'SELECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Verify recruiter owns the opportunity
    const appResult = await db.execute({
      sql: `SELECT a.*, o.title, o.recruiter_id FROM applications a JOIN opportunities o ON a.opportunity_id = o.id WHERE a.id = ?`,
      args: [id],
    });

    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const app = appResult.rows[0] as any;
    if (app.recruiter_id !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute({
      sql: 'UPDATE applications SET status = ?, notes = COALESCE(?, notes), updated_at = datetime(\'now\') WHERE id = ?',
      args: [status, notes || null, id],
    });

    // Notify student
    const statusMessages: Record<string, string> = {
      UNDER_REVIEW: `Your application for "${app.title}" is now under review`,
      SHORTLISTED: `Congratulations! You have been shortlisted for "${app.title}"`,
      REJECTED: `We regret to inform you that your application for "${app.title}" was not selected`,
      SELECTED: `Congratulations! You have been selected for "${app.title}"!`,
    };

    if (statusMessages[status]) {
      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
        args: [cuid(), app.student_id, statusMessages[status], status === 'SELECTED' || status === 'SHORTLISTED' ? 'SUCCESS' : status === 'REJECTED' ? 'WARNING' : 'APPLICATION'],
      });
    }

    return res.json({ message: 'Application status updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update status' });
  }
}

export async function getAllApplications(req: AuthRequest, res: Response) {
  try {
    // Admin only
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `SELECT a.*, u.name as student_name, o.title as opportunity_title, rp.company_name
               FROM applications a
               JOIN users u ON a.student_id = u.id
               JOIN opportunities o ON a.opportunity_id = o.id
               LEFT JOIN recruiter_profiles rp ON rp.user_id = o.recruiter_id
               WHERE 1=1`;
    const args: any[] = [];

    if (status) { sql += ' AND a.status = ?'; args.push(status); }
    sql += ' ORDER BY a.applied_at DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), offset);

    const result = await db.execute({ sql, args });
    return res.json({ applications: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get applications' });
  }
}
