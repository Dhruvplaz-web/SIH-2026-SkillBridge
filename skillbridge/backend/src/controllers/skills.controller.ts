import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';

export async function getSkills(req: Request, res: Response) {
  try {
    const { category } = req.query;
    let sql = 'SELECT * FROM skills ORDER BY category, name';
    const args: any[] = [];

    if (category) {
      sql = 'SELECT * FROM skills WHERE category = ? ORDER BY name';
      args.push(category);
    }

    const result = await db.execute({ sql, args });

    // Group by category
    const grouped: Record<string, any[]> = {};
    for (const row of result.rows as any[]) {
      if (!grouped[row.category]) grouped[row.category] = [];
      grouped[row.category].push(row);
    }

    return res.json({ skills: result.rows, grouped, total: result.rows.length });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get skills' });
  }
}

export async function getUserSkills(req: AuthRequest, res: Response) {
  try {
    const userId = req.params.userId || req.user!.id;

    const result = await db.execute({
      sql: `SELECT us.id, us.user_id, us.skill_id, us.proficiency, us.assessment_score, us.verified, us.created_at, us.updated_at,
                   s.name as skill_name, s.category
            FROM user_skills us
            JOIN skills s ON us.skill_id = s.id
            WHERE us.user_id = ?
            ORDER BY s.category, s.name`,
      args: [userId],
    });

    return res.json({ skills: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get user skills' });
  }
}

export async function addUserSkill(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { skillId, proficiency } = req.body;

    if (!skillId || !proficiency) {
      return res.status(400).json({ error: 'skillId and proficiency are required' });
    }

    const validProf = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
    if (!validProf.includes(proficiency)) {
      return res.status(400).json({ error: 'Invalid proficiency level' });
    }

    // Check skill exists
    const skillCheck = await db.execute({ sql: 'SELECT id FROM skills WHERE id = ?', args: [skillId] });
    if (skillCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    // Upsert
    const existing = await db.execute({ sql: 'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?', args: [userId, skillId] });

    if (existing.rows.length > 0) {
      await db.execute({
        sql: 'UPDATE user_skills SET proficiency = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND skill_id = ?',
        args: [proficiency, userId, skillId],
      });
      return res.json({ message: 'Skill updated' });
    } else {
      const id = cuid();
      await db.execute({
        sql: 'INSERT INTO user_skills (id, user_id, skill_id, proficiency) VALUES (?, ?, ?, ?)',
        args: [id, userId, skillId, proficiency],
      });
      return res.status(201).json({ message: 'Skill added', id });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to add skill' });
  }
}

export async function updateUserSkill(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { skillId } = req.params;
    const { proficiency } = req.body;

    await db.execute({
      sql: 'UPDATE user_skills SET proficiency = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND skill_id = ?',
      args: [proficiency, userId, skillId],
    });

    return res.json({ message: 'Skill updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update skill' });
  }
}

export async function deleteUserSkill(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { skillId } = req.params;

    await db.execute({
      sql: 'DELETE FROM user_skills WHERE user_id = ? AND skill_id = ?',
      args: [userId, skillId],
    });

    return res.json({ message: 'Skill removed' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to remove skill' });
  }
}

export async function createSkill(req: AuthRequest, res: Response) {
  try {
    const { name, category, description } = req.body;
    if (!name || !category) return res.status(400).json({ error: 'Name and category required' });

    const id = cuid();
    await db.execute({
      sql: 'INSERT OR IGNORE INTO skills (id, name, category, description) VALUES (?, ?, ?, ?)',
      args: [id, name, category, description || ''],
    });

    return res.status(201).json({ message: 'Skill created', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create skill' });
  }
}
