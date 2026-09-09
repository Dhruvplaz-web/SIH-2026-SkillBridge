import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';

export async function getTrainingPrograms(req: Request, res: Response) {
  try {
    const { category, level, search } = req.query;

    let sql = `SELECT tp.*, u.name as created_by_name,
                      (SELECT COUNT(*) FROM enrollments e WHERE e.training_program_id = tp.id) as enrollment_count,
                      GROUP_CONCAT(s.name) as skill_names
               FROM training_programs tp
               JOIN users u ON tp.created_by_id = u.id
               LEFT JOIN training_skills ts ON ts.training_program_id = tp.id
               LEFT JOIN skills s ON ts.skill_id = s.id
               WHERE tp.is_active = 1`;
    const args: any[] = [];

    if (category) { sql += ' AND tp.category = ?'; args.push(category); }
    if (level) { sql += ' AND tp.level = ?'; args.push(level); }
    if (search) { sql += ' AND (tp.title LIKE ? OR tp.description LIKE ?)'; args.push(`%${search}%`, `%${search}%`); }

    sql += ' GROUP BY tp.id ORDER BY tp.created_at DESC';

    const result = await db.execute({ sql, args });
    return res.json({ programs: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get training programs' });
  }
}

export async function getTrainingProgramById(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const result = await db.execute({
      sql: `SELECT tp.*, u.name as created_by_name
            FROM training_programs tp
            JOIN users u ON tp.created_by_id = u.id
            WHERE tp.id = ?`,
      args: [id],
    });

    if (result.rows.length === 0) return res.status(404).json({ error: 'Training program not found' });

    const program = result.rows[0] as any;

    const skills = await db.execute({
      sql: 'SELECT s.* FROM training_skills ts JOIN skills s ON ts.skill_id = s.id WHERE ts.training_program_id = ?',
      args: [id],
    });

    const enrollCount = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM enrollments WHERE training_program_id = ?',
      args: [id],
    });

    return res.json({ program: { ...program, skills: skills.rows, enrollmentCount: (enrollCount.rows[0] as any).count } });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get program' });
  }
}

export async function createTrainingProgram(req: AuthRequest, res: Response) {
  try {
    const createdById = req.user!.id;
    const { title, description, level, duration, provider, externalUrl, category, skills } = req.body;

    if (!title || !description || !category) {
      return res.status(400).json({ error: 'Title, description and category are required' });
    }

    const id = cuid();
    await db.execute({
      sql: `INSERT INTO training_programs (id, created_by_id, title, description, level, duration, provider, external_url, category)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [id, createdById, title, description, level || 'BEGINNER', duration || '', provider || '', externalUrl || '', category],
    });

    if (skills && Array.isArray(skills)) {
      for (const skillId of skills) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO training_skills (id, training_program_id, skill_id) VALUES (?, ?, ?)',
          args: [cuid(), id, skillId],
        });
      }
    }

    // Notify students
    const students = await db.execute({ sql: 'SELECT id FROM users WHERE role = ? LIMIT 10', args: ['STUDENT'] });
    for (const student of students.rows as any[]) {
      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
        args: [cuid(), student.id, `New training program available: "${title}"`, 'TRAINING'],
      });
    }

    return res.status(201).json({ message: 'Training program created', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to create training program' });
  }
}

export async function updateTrainingProgram(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { title, description, level, duration, provider, externalUrl, category, isActive, skills } = req.body;

    await db.execute({
      sql: `UPDATE training_programs SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        level = COALESCE(?, level),
        duration = COALESCE(?, duration),
        provider = COALESCE(?, provider),
        external_url = COALESCE(?, external_url),
        category = COALESCE(?, category),
        is_active = COALESCE(?, is_active),
        updated_at = datetime('now')
        WHERE id = ?`,
      args: [title || null, description || null, level || null, duration || null, provider || null, externalUrl || null, category || null, isActive !== undefined ? (isActive ? 1 : 0) : null, id],
    });

    if (skills && Array.isArray(skills)) {
      await db.execute({ sql: 'DELETE FROM training_skills WHERE training_program_id = ?', args: [id] });
      for (const skillId of skills) {
        await db.execute({
          sql: 'INSERT OR IGNORE INTO training_skills (id, training_program_id, skill_id) VALUES (?, ?, ?)',
          args: [cuid(), id, skillId],
        });
      }
    }

    return res.json({ message: 'Training program updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update training program' });
  }
}

export async function enrollInProgram(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;
    const { id } = req.params;

    // Check exists
    const prog = await db.execute({ sql: 'SELECT id, title FROM training_programs WHERE id = ? AND is_active = 1', args: [String(id)] });
    if (prog.rows.length === 0) return res.status(404).json({ error: 'Program not found' });

    // Check duplicate
    const dup = await db.execute({ sql: 'SELECT id FROM enrollments WHERE student_id = ? AND training_program_id = ?', args: [studentId, String(id)] });
    if (dup.rows.length > 0) return res.status(409).json({ error: 'Already enrolled' });

    const enrollId = cuid();
    await db.execute({
      sql: 'INSERT INTO enrollments (id, student_id, training_program_id) VALUES (?, ?, ?)',
      args: [enrollId, studentId, String(id)],
    });

    const programTitle = (prog.rows[0] as any).title;
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), studentId, `Enrolled in "${programTitle}"`, 'SUCCESS'],
    });

    return res.status(201).json({ message: 'Enrolled successfully', id: enrollId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to enroll' });
  }
}

export async function updateEnrollmentProgress(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;
    const { id } = req.params; // enrollment id
    const { progress } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    const completed = progress >= 100 ? 1 : 0;
    const completedAt = completed ? new Date().toISOString() : null;

    await db.execute({
      sql: 'UPDATE enrollments SET progress = ?, completed = ?, completed_at = ? WHERE id = ? AND student_id = ?',
      args: [progress, completed, completedAt, String(id), studentId],
    });

    if (completed) {
      // Update skills based on training program
      const enrollment = await db.execute({
        sql: 'SELECT training_program_id FROM enrollments WHERE id = ?',
        args: [String(id)],
      });
      if (enrollment.rows.length > 0) {
        const tpId = (enrollment.rows[0] as any).training_program_id;
        const trainingSkills = await db.execute({
          sql: 'SELECT skill_id FROM training_skills WHERE training_program_id = ?',
          args: [tpId],
        });

        for (const ts of trainingSkills.rows as any[]) {
          const existing = await db.execute({
            sql: 'SELECT id, proficiency FROM user_skills WHERE user_id = ? AND skill_id = ?',
            args: [studentId, ts.skill_id],
          });

          if (existing.rows.length === 0) {
            await db.execute({
              sql: 'INSERT INTO user_skills (id, user_id, skill_id, proficiency) VALUES (?, ?, ?, ?)',
              args: [cuid(), studentId, ts.skill_id, 'INTERMEDIATE'],
            });
          } else {
            const current = (existing.rows[0] as any).proficiency;
            if (current === 'BEGINNER') {
              await db.execute({
                sql: 'UPDATE user_skills SET proficiency = ? WHERE user_id = ? AND skill_id = ?',
                args: ['INTERMEDIATE', studentId, ts.skill_id],
              });
            }
          }
        }

        const tp = await db.execute({ sql: 'SELECT title FROM training_programs WHERE id = ?', args: [tpId] });
        const title = (tp.rows[0] as any)?.title || 'Training Program';

        await db.execute({
          sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
          args: [cuid(), studentId, `Completed "${title}"! Your skills have been updated.`, 'SUCCESS'],
        });
      }
    }

    return res.json({ message: 'Progress updated', completed: completed === 1 });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update progress' });
  }
}

export async function getStudentEnrollments(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;

    const result = await db.execute({
      sql: `SELECT e.*, tp.title, tp.category, tp.level, tp.duration, tp.provider, tp.external_url,
                   GROUP_CONCAT(s.name) as skill_names
            FROM enrollments e
            JOIN training_programs tp ON e.training_program_id = tp.id
            LEFT JOIN training_skills ts ON ts.training_program_id = tp.id
            LEFT JOIN skills s ON ts.skill_id = s.id
            WHERE e.student_id = ?
            GROUP BY e.id
            ORDER BY e.enrolled_at DESC`,
      args: [studentId],
    });

    return res.json({ enrollments: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get enrollments' });
  }
}
