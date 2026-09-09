import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid, mapScoreToProficiency } from '../utils/helpers';
import crypto from 'crypto';

export async function getAssessments(req: Request, res: Response) {
  try {
    const { category } = req.query;
    let sql = `SELECT a.*, 
                      (SELECT COUNT(*) FROM questions q WHERE q.assessment_id = a.id) as question_count
               FROM assessments a WHERE a.is_active = 1`;
    const args: any[] = [];

    if (category) {
      sql += ' AND a.category = ?';
      args.push(category);
    }
    sql += ' ORDER BY a.category, a.title';

    const result = await db.execute({ sql, args });
    return res.json({ assessments: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get assessments' });
  }
}

export async function getAssessmentById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const aResult = await db.execute({
      sql: 'SELECT * FROM assessments WHERE id = ? AND is_active = 1',
      args: [id],
    });

    if (aResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const assessment = aResult.rows[0] as any;

    const qResult = await db.execute({
      sql: 'SELECT id, question, options, difficulty, points FROM questions WHERE assessment_id = ? ORDER BY rowid ASC',
      args: [id],
    });

    // Parse options safely: whether stored as JSON string or raw array
    const questions = (qResult.rows as any[]).map(q => {
      let parsedOptions: string[] = [];
      if (Array.isArray(q.options)) {
        parsedOptions = q.options;
      } else if (typeof q.options === 'string') {
        try {
          const parsed = JSON.parse(q.options);
          parsedOptions = Array.isArray(parsed) ? parsed : [q.options];
        } catch {
          parsedOptions = q.options.split(',').map((s: string) => s.trim());
        }
      }
      return {
        ...q,
        options: parsedOptions,
      };
    });

    // Check if user already took this
    let previousResult = null;
    if ((req as AuthRequest).user) {
      const prevResult = await db.execute({
        sql: 'SELECT * FROM assessment_results WHERE user_id = ? AND assessment_id = ? ORDER BY completed_at DESC LIMIT 1',
        args: [(req as AuthRequest).user!.id, id],
      });
      if (prevResult.rows.length > 0) previousResult = prevResult.rows[0];
    }

    return res.json({ assessment, questions, previousResult });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get assessment' });
  }
}

export async function submitAssessment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { answers } = req.body; // Array of answer indices or object map

    if (!answers) {
      return res.status(400).json({ error: 'Answers required' });
    }

    // Get questions with correct answers in EXACT SAME rowid ASC order as getAssessmentById
    const qResult = await db.execute({
      sql: 'SELECT id, question, options, correct_answer, points, difficulty, explanation FROM questions WHERE assessment_id = ? ORDER BY rowid ASC',
      args: [id],
    });

    if (qResult.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }

    const questions = qResult.rows as any[];
    let score = 0;
    let totalPoints = 0;

    const breakdown = questions.map((q, i) => {
      const userAns = Array.isArray(answers) ? answers[i] : answers[q.id];
      const pts = q.points || 1;
      totalPoints += pts;
      const isCorrect = userAns !== undefined && userAns !== null && userAns === q.correct_answer;
      if (isCorrect) {
        score += pts;
      }
      return {
        questionId: q.id,
        question: q.question,
        userAnswer: userAns !== undefined && userAns !== null ? userAns : null,
        correctAnswer: q.correct_answer,
        isCorrect,
        points: pts,
        explanation: q.explanation || null,
      };
    });

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0;
    const proficiency = mapScoreToProficiency(percentage);

    // Store result
    const resultId = cuid();
    await db.execute({
      sql: 'INSERT INTO assessment_results (id, user_id, assessment_id, score, total_points, percentage, proficiency, answers) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [resultId, userId, id, score, totalPoints, percentage, proficiency, JSON.stringify(answers)],
    });

    // Get student details and assessment info
    const userRes = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [userId] });
    const studentName = (userRes.rows[0] as any)?.name || 'Student';

    const aResult = await db.execute({ sql: 'SELECT title, category FROM assessments WHERE id = ?', args: [id] });
    const assessmentTitle = (aResult.rows[0] as any)?.title || 'Skill Assessment';
    const category = (aResult.rows[0] as any)?.category;

    // Find matching skill and update proficiency
    if (category) {
      const skillResult = await db.execute({
        sql: 'SELECT id FROM skills WHERE category = ? OR name = ? LIMIT 1',
        args: [category, category],
      });

      if (skillResult.rows.length > 0) {
        const skillId = (skillResult.rows[0] as any).id;
        const existingSkill = await db.execute({
          sql: 'SELECT id FROM user_skills WHERE user_id = ? AND skill_id = ?',
          args: [userId, skillId],
        });

        if (existingSkill.rows.length > 0) {
          await db.execute({
            sql: 'UPDATE user_skills SET proficiency = ?, assessment_score = ?, verified = 1, updated_at = datetime(\'now\') WHERE user_id = ? AND skill_id = ?',
            args: [proficiency, Math.round(percentage), userId, skillId],
          });
        } else {
          await db.execute({
            sql: 'INSERT INTO user_skills (id, user_id, skill_id, proficiency, assessment_score, verified) VALUES (?, ?, ?, ?, ?, 1)',
            args: [cuid(), userId, skillId, proficiency, Math.round(percentage)],
          });
        }
      }
    }

    // Anchor to TrustLedger if passing score (percentage >= 50)
    let blockHash: string | null = null;
    let ledgerBlockId: string | null = null;
    if (percentage >= 50) {
      const timestamp = new Date().toISOString();
      const raw = `${studentName}|${assessmentTitle}|SkillSetu AICTE Proctoring Hub|${timestamp}|sovereign_quiz_salt_2026`;
      blockHash = '0x' + crypto.createHash('sha256').update(raw).digest('hex');
      ledgerBlockId = 'BLK-' + Math.floor(1000 + Math.random() * 9000);

      try {
        await db.execute({
          sql: `INSERT INTO trust_ledger_blocks (id, block_hash, student_name, skill_name, endorser, timestamp, status, metadata)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            ledgerBlockId,
            blockHash,
            studentName,
            assessmentTitle,
            'SkillSetu AICTE Proctoring Hub',
            'Just now',
            'verified',
            JSON.stringify({ percentage: Math.round(percentage), proficiency, score, totalPoints, assessmentId: id })
          ]
        });
      } catch (blockErr) {
        console.warn('Could not insert ledger block:', blockErr);
      }
    }

    // Create notification
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), userId, `Assessment completed! Score: ${Math.round(percentage)}% (${proficiency})${blockHash ? ' - Anchored to TrustLedger' : ''}`, 'INFO'],
    });

    return res.json({
      message: 'Assessment submitted',
      result: {
        id: resultId,
        score,
        totalPoints,
        percentage: Math.round(percentage),
        proficiency,
        blockHash,
        ledgerBlockId,
        breakdown,
      },
      blockHash,
      ledgerBlockId,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to submit assessment' });
  }
}

export async function getAssessmentHistory(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const result = await db.execute({
      sql: `SELECT ar.*, a.title, a.category, a.difficulty
            FROM assessment_results ar
            JOIN assessments a ON ar.assessment_id = a.id
            WHERE ar.user_id = ?
            ORDER BY ar.completed_at DESC`,
      args: [userId],
    });

    return res.json({ history: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get assessment history' });
  }
}
