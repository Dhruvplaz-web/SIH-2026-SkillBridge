import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';

export async function getOpportunities(req: Request, res: Response) {
  try {
    const { type, location, search, skillId, page = 1, limit = 12 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = `
      SELECT o.*, 
             u.name as recruiter_name,
             rp.company_name,
             rp.industry,
             (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id) as application_count
      FROM opportunities o
      JOIN users u ON o.recruiter_id = u.id
      LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
      WHERE o.is_active = 1
    `;
    const args: any[] = [];

    if (type) { sql += ' AND o.type = ?'; args.push(type); }
    if (location) { sql += ' AND o.location LIKE ?'; args.push(`%${location}%`); }
    if (search) { sql += ' AND (o.title LIKE ? OR o.description LIKE ?)'; args.push(`%${search}%`, `%${search}%`); }

    const countResult = await db.execute({ sql: sql.replace(/SELECT o\.\*.*?FROM opportunities o/, 'SELECT COUNT(*) as count FROM opportunities o'), args });
    const total = (countResult.rows[0] as any)?.count || 0;

    sql += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), offset);

    const result = await db.execute({ sql, args });

    // Get skills for each opportunity
    const opps = await Promise.all((result.rows as any[]).map(async (opp) => {
      const skills = await db.execute({
        sql: `SELECT os.importance, s.id, s.name, s.category FROM opportunity_skills os JOIN skills s ON os.skill_id = s.id WHERE os.opportunity_id = ?`,
        args: [opp.id],
      });
      return { ...opp, skills: skills.rows };
    }));

    return res.json({ opportunities: opps, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get opportunities' });
  }
}

export async function getOpportunityById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT o.*, u.name as recruiter_name, rp.company_name, rp.industry, rp.location as company_location, rp.website
            FROM opportunities o
            JOIN users u ON o.recruiter_id = u.id
            LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
            WHERE o.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) return res.status(404).json({ error: 'Opportunity not found' });

    const opp = result.rows[0] as any;

    const skills = await db.execute({
      sql: `SELECT os.importance, s.id, s.name, s.category FROM opportunity_skills os JOIN skills s ON os.skill_id = s.id WHERE os.opportunity_id = ?`,
      args: [id],
    });

    const appCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM applications WHERE opportunity_id = ?',
      args: [id],
    });

    return res.json({ opportunity: { ...opp, skills: skills.rows, applicationCount: (appCount.rows[0] as any).count } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get opportunity' });
  }
}

export async function createOpportunity(req: AuthRequest, res: Response) {
  try {
    const recruiterId = req.user!.id;
    const { title, description, type, location, locationType, duration, stipend, salaryRange, deadline, eligibility, requirements, responsibilities, benefits, skills } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Title, description and type are required' });
    }

    const id = cuid();
    await db.execute({
      sql: `INSERT INTO opportunities (id, recruiter_id, title, description, type, location, location_type, duration, stipend, salary_range, deadline, eligibility, requirements, responsibilities, benefits)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, recruiterId, title, description, type, location || '', locationType || 'ONSITE', duration || '', stipend || '', salaryRange || '', deadline || null, eligibility || '', requirements || '', responsibilities || '', benefits || ''],
    });

    // Add skills
    if (skills && Array.isArray(skills)) {
      for (const skill of skills) {
        const skillId = typeof skill === 'string' ? skill : skill.skillId;
        const importance = typeof skill === 'object' ? skill.importance : 'REQUIRED';
        await db.execute({
          sql: 'INSERT OR IGNORE INTO opportunity_skills (id, opportunity_id, skill_id, importance) VALUES (?, ?, ?, ?)',
          args: [cuid(), id, skillId, importance || 'REQUIRED'],
        });
      }
    }

    // Notify matched students
    notifyMatchedStudents(id, title).catch(console.error);

    return res.status(201).json({ message: 'Opportunity created', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create opportunity' });
  }
}

async function notifyMatchedStudents(opportunityId: string, title: string) {
  // Get top 5 matching students and notify them
  const students = await db.execute({ sql: 'SELECT id FROM users WHERE role = ? LIMIT 5', args: ['STUDENT'] });
  for (const student of students.rows as any[]) {
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), student.id, `New opportunity matching your profile: "${title}"`, 'INFO'],
    });
  }
}

export async function updateOpportunity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.id;
    const { title, description, type, location, locationType, duration, stipend, salaryRange, deadline, eligibility, requirements, responsibilities, benefits, isActive, skills } = req.body;

    // Verify ownership
    const check = await db.execute({ sql: 'SELECT id FROM opportunities WHERE id = ? AND recruiter_id = ?', args: [id, recruiterId] });
    if (check.rows.length === 0 && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute({
      sql: `UPDATE opportunities SET 
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        type = COALESCE(?, type),
        location = COALESCE(?, location),
        location_type = COALESCE(?, location_type),
        duration = COALESCE(?, duration),
        stipend = COALESCE(?, stipend),
        salary_range = COALESCE(?, salary_range),
        deadline = COALESCE(?, deadline),
        eligibility = COALESCE(?, eligibility),
        requirements = COALESCE(?, requirements),
        responsibilities = COALESCE(?, responsibilities),
        benefits = COALESCE(?, benefits),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
        WHERE id = ?`,
      args: [title || null, description || null, type || null, location || null, locationType || null, duration || null, stipend || null, salaryRange || null, deadline || null, eligibility || null, requirements || null, responsibilities || null, benefits || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id],
    });

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      await db.execute({ sql: 'DELETE FROM opportunity_skills WHERE opportunity_id = ?', args: [id] });
      for (const skill of skills) {
        const skillId = typeof skill === 'string' ? skill : skill.skillId;
        const importance = typeof skill === 'object' ? skill.importance : 'REQUIRED';
        await db.execute({
          sql: 'INSERT OR IGNORE INTO opportunity_skills (id, opportunity_id, skill_id, importance) VALUES (?, ?, ?, ?)',
          args: [cuid(), id, skillId, importance || 'REQUIRED'],
        });
      }
    }

    return res.json({ message: 'Opportunity updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update opportunity' });
  }
}

export async function deleteOpportunity(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const recruiterId = req.user!.id;

    const check = await db.execute({ sql: 'SELECT id FROM opportunities WHERE id = ? AND recruiter_id = ?', args: [id, recruiterId] });
    if (check.rows.length === 0 && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute({ sql: 'DELETE FROM opportunities WHERE id = ?', args: [id] });
    return res.json({ message: 'Opportunity deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete opportunity' });
  }
}

export async function getRecruiterOpportunities(req: AuthRequest, res: Response) {
  try {
    const recruiterId = req.user!.id;

    const result = await db.execute({
      sql: `SELECT o.*, 
                   (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id) as application_count,
                   (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id AND a.status = 'SHORTLISTED') as shortlisted_count,
                   (SELECT COUNT(*) FROM applications a WHERE a.opportunity_id = o.id AND a.status = 'SELECTED') as selected_count
            FROM opportunities o
            WHERE o.recruiter_id = ?
            ORDER BY o.created_at DESC`,
      args: [recruiterId],
    });

    return res.json({ opportunities: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get opportunities' });
  }
}
