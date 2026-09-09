import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getStudentRecommendations, analyzeSkillGaps, matchStudentsForOpportunity, calculateMatchScore } from '../services/recommendation.service';
import { db } from '../database/db';

export async function getRecommendations(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const recommendations = await getStudentRecommendations(userId);
    return res.json(recommendations);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
}

export async function getSkillGaps(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const analysis = await analyzeSkillGaps(userId);
    return res.json(analysis);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to analyze skill gaps' });
  }
}

export async function matchSkills(req: AuthRequest, res: Response) {
  try {
    const { opportunityId, studentId } = req.body;
    const targetStudentId = studentId || req.user!.id;
    const score = await calculateMatchScore(targetStudentId, opportunityId);
    return res.json({ matchScore: score });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate match score' });
  }
}

export async function getMatchedStudents(req: AuthRequest, res: Response) {
  try {
    const { opportunityId } = req.params;
    const { limit = 10 } = req.query;

    // Verify recruiter owns this opportunity
    const oppCheck = await db.execute({
      sql: 'SELECT id FROM opportunities WHERE id = ? AND recruiter_id = ?',
      args: [opportunityId, req.user!.id],
    });
    if (oppCheck.rows.length === 0 && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const matched = await matchStudentsForOpportunity(String(opportunityId), Number(limit));
    return res.json({ students: matched });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to match students' });
  }
}
