import { Request, Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid, mapScoreToProficiency } from '../utils/helpers';
import { executeCodeChallenge } from '../utils/codeRunner';
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
    const { answers, tabSwitches = 0, integrityScore = 100, proctorStatus = 'CLEAN' } = req.body; // Array of answer indices or object map

    if (!answers) {
      return res.status(400).json({ error: 'Answers required' });
    }

    // Proctoring threshold check: 3+ tab switches or integrity < 60% voids the assessment
    const isProctorViolation = integrityScore < 60 || tabSwitches >= 3 || proctorStatus === 'DISQUALIFIED';

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

    const finalProficiency = isProctorViolation ? 'VOID_PROCTOR_BREACH' : proficiency;
    const finalProctorStatus = isProctorViolation ? 'PROCTOR_VIOLATION' : proctorStatus;

    // Store result with proctoring audit telemetry
    const resultId = cuid();
    await db.execute({
      sql: `INSERT INTO assessment_results 
            (id, user_id, assessment_id, score, total_points, percentage, proficiency, answers, tab_switches, integrity_score, proctor_status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [resultId, userId, id, score, totalPoints, percentage, finalProficiency, JSON.stringify(answers), tabSwitches, integrityScore, finalProctorStatus],
    });

    if (isProctorViolation) {
      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
        args: [
          cuid(),
          userId,
          `Assessment voided due to proctoring breaches: Integrity at ${integrityScore}%, ${tabSwitches} tab switch violations detected. Badges and ledger verification suspended.`,
          'ALERT'
        ],
      });

      return res.json({
        message: 'Assessment submitted but VOIDED due to proctoring breaches.',
        proctorViolation: true,
        result: {
          id: resultId,
          score,
          totalPoints,
          percentage: Math.round(percentage),
          proficiency: 'VOID_PROCTOR_BREACH',
          blockHash: null,
          ledgerBlockId: null,
          breakdown,
          badge: null,
          integrityScore,
          tabSwitches,
          proctorStatus: 'PROCTOR_VIOLATION',
          violationReason: tabSwitches >= 3 
            ? 'Disqualified: Exceeded maximum permitted window/tab switches (3 strikes).' 
            : 'Disqualified: Exam integrity score dropped below acceptable 60% threshold.'
        },
        blockHash: null,
        ledgerBlockId: null,
        badge: null,
      });
    }

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
    let awardedBadge: any = null;

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

      // Mint or update accredited badge (GOLD: >=90%, SILVER: >=75%, BRONZE: >=50%)
      const tier = percentage >= 90 ? 'GOLD' : percentage >= 75 ? 'SILVER' : 'BRONZE';
      const badgeId = `badge_${(category || 'cs').toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
      const badgeName = `${assessmentTitle} Mastery`;
      const badgeDbId = cuid();
      const rawVerification = `${userId}|${badgeId}|${tier}|${Math.round(percentage)}|${blockHash || Date.now()}`;
      const verificationHash = '0x' + crypto.createHash('sha256').update(rawVerification).digest('hex');

      try {
        const existingBadge = await db.execute({
          sql: 'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
          args: [userId, badgeId]
        });

        if (existingBadge.rows.length === 0) {
          await db.execute({
            sql: `INSERT INTO user_badges (id, user_id, badge_id, badge_name, badge_category, tier, score, assessment_title, verification_hash, ledger_block_id, issuer)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [badgeDbId, userId, badgeId, badgeName, category || 'Engineering', tier, Math.round(percentage), assessmentTitle, verificationHash, ledgerBlockId || 'BLK-9000', 'AICTE SkillSetu National Accreditation Council']
          });
          awardedBadge = {
            id: badgeDbId,
            badge_id: badgeId,
            badge_name: badgeName,
            badge_category: category || 'Engineering',
            tier,
            score: Math.round(percentage),
            verification_hash: verificationHash,
            ledger_block_id: ledgerBlockId,
            isNew: true
          };
        } else {
          const prev = existingBadge.rows[0] as any;
          if (Math.round(percentage) > (prev.score || 0)) {
            await db.execute({
              sql: `UPDATE user_badges SET tier = ?, score = ?, verification_hash = ?, ledger_block_id = ?, issued_at = datetime('now') WHERE id = ?`,
              args: [tier, Math.round(percentage), verificationHash, ledgerBlockId || 'BLK-9000', prev.id]
            });
            awardedBadge = { ...prev, tier, score: Math.round(percentage), verification_hash: verificationHash, isUpgrade: true };
          } else {
            awardedBadge = prev;
          }
        }
      } catch (bErr) {
        console.warn('Could not insert badge:', bErr);
      }
    }

    // Create notification
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [
        cuid(),
        userId,
        `Assessment completed! Score: ${Math.round(percentage)}% (${proficiency})${blockHash ? ' - Anchored to TrustLedger' : ''}${awardedBadge ? ` - Awarded ${awardedBadge.tier} Badge!` : ''}`,
        'INFO'
      ],
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
        badge: awardedBadge,
        integrityScore,
        tabSwitches,
        proctorStatus: 'CLEAN',
      },
      blockHash,
      ledgerBlockId,
      badge: awardedBadge,
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

/**
 * Fetch Accredited Skill Badges for the authenticated student (or specified userId)
 */
export async function getUserBadges(req: AuthRequest, res: Response) {
  try {
    const userId = (req.query.userId as string) || req.user!.id;
    const result = await db.execute({
      sql: 'SELECT * FROM user_badges WHERE user_id = ? ORDER BY issued_at DESC',
      args: [userId]
    });

    const badges = result.rows as any[];
    const stats = {
      total: badges.length,
      gold: badges.filter(b => b.tier === 'GOLD').length,
      silver: badges.filter(b => b.tier === 'SILVER').length,
      bronze: badges.filter(b => b.tier === 'BRONZE').length,
    };

    return res.json({ badges, stats });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch accredited badges' });
  }
}

/**
 * Fetch all Coding Challenges for the Practical Coding Arena
 */
export async function getCodingChallenges(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const result = await db.execute({
      sql: 'SELECT id, title, language, difficulty, description, starter_code, test_cases, created_at FROM coding_sandboxes ORDER BY difficulty, title',
      args: []
    });

    const challenges = await Promise.all((result.rows as any[]).map(async (row) => {
      let testCases: any[] = [];
      try {
        testCases = JSON.parse(row.test_cases || '[]');
      } catch {
        testCases = [];
      }

      let bestSubmission = null;
      if (userId) {
        const subRes = await db.execute({
          sql: 'SELECT * FROM coding_submissions WHERE sandbox_id = ? AND candidate_id = ? ORDER BY passed_tests DESC, created_at DESC LIMIT 1',
          args: [row.id, userId]
        });
        if (subRes.rows.length > 0) {
          bestSubmission = subRes.rows[0];
        }
      }

      const formattedCases = testCases.map((tc, idx) => ({
        index: idx + 1,
        input: tc.input,
        expected: tc.hidden ? '[Hidden Edge Test Case]' : tc.expected,
        description: tc.description || '',
        hidden: !!tc.hidden
      }));

      return {
        ...row,
        test_cases: formattedCases,
        total_test_cases: testCases.length,
        public_test_cases_count: testCases.filter(t => !t.hidden).length,
        bestSubmission
      };
    }));

    return res.json({ challenges });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get coding challenges' });
  }
}

/**
 * Run public test cases without grading/submitting (Sandbox test run)
 */
export async function runCodingChallenge(req: AuthRequest, res: Response) {
  try {
    const { challengeId, code, language } = req.body;
    if (!challengeId || !code) {
      return res.status(400).json({ error: 'Challenge ID and code are required' });
    }

    const sbResult = await db.execute({
      sql: 'SELECT * FROM coding_sandboxes WHERE id = ?',
      args: [challengeId]
    });

    if (sbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Coding challenge not found' });
    }

    const sandbox = sbResult.rows[0] as any;
    let testCases: any[] = [];
    try {
      testCases = JSON.parse(sandbox.test_cases || '[]');
    } catch {
      testCases = [];
    }

    // Run only public test cases
    const evalResult = await executeCodeChallenge(code, language || sandbox.language || 'python', testCases, true);
    return res.json(evalResult);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Execution error' });
  }
}

/**
 * Submit code for full evaluation (all public + hidden test cases, Big-O complexity, Ledger minting, Badge award)
 */
export async function submitCodingChallenge(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { challengeId, code, language, tabSwitches = 0 } = req.body;

    if (!challengeId || !code) {
      return res.status(400).json({ error: 'Challenge ID and code are required' });
    }

    const sbResult = await db.execute({
      sql: 'SELECT * FROM coding_sandboxes WHERE id = ?',
      args: [challengeId]
    });

    if (sbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Coding challenge not found' });
    }

    const sandbox = sbResult.rows[0] as any;
    let testCases: any[] = [];
    try {
      testCases = JSON.parse(sandbox.test_cases || '[]');
    } catch {
      testCases = [];
    }

    // Run ALL test cases
    const evalResult = await executeCodeChallenge(code, language || sandbox.language || 'python', testCases, false);

    // Proctor score calculation (penalize 10 points per tab switch)
    const proctorScore = Math.max(30, 100 - (tabSwitches * 10));

    // Get user info
    const userRes = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [userId] });
    const studentName = (userRes.rows[0] as any)?.name || 'Student';

    // Record submission
    const submissionId = cuid();
    await db.execute({
      sql: `INSERT INTO coding_submissions (id, sandbox_id, candidate_id, candidate_name, code, passed_tests, total_tests, execution_time_ms, proctor_score, tab_switches, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        submissionId,
        challengeId,
        userId,
        studentName,
        code,
        evalResult.passedTests,
        evalResult.totalTests,
        evalResult.executionTimeMs,
        proctorScore,
        tabSwitches,
        evalResult.success ? 'COMPLETED' : 'FAILED'
      ]
    });

    let blockHash: string | null = null;
    let ledgerBlockId: string | null = null;
    let awardedBadge: any = null;

    if (evalResult.score >= 50) {
      const timestamp = new Date().toISOString();
      const raw = `${studentName}|${sandbox.title}|Coding Arena Proctor|${timestamp}|${evalResult.score}%`;
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
            `Coding Arena: ${sandbox.title}`,
            'AICTE SkillSetu Practical Sandbox Engine',
            'Just now',
            'verified',
            JSON.stringify({
              challengeId,
              score: evalResult.score,
              passedTests: evalResult.passedTests,
              totalTests: evalResult.totalTests,
              bigO: evalResult.bigOEstimate,
              executionTimeMs: evalResult.executionTimeMs,
              proctorScore
            })
          ]
        });
      } catch (ledgerErr) {
        console.warn('Could not insert ledger block:', ledgerErr);
      }

      // Mint or update accredited badge (GOLD: >=90%, SILVER: >=75%, BRONZE: >=50%)
      const tier = evalResult.score >= 90 ? 'GOLD' : evalResult.score >= 75 ? 'SILVER' : 'BRONZE';
      const badgeId = `badge_code_${challengeId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
      const badgeName = `${sandbox.title} Practical Specialist`;
      const badgeDbId = cuid();
      const rawVerification = `${userId}|${badgeId}|${tier}|${evalResult.score}|${blockHash}`;
      const verificationHash = '0x' + crypto.createHash('sha256').update(rawVerification).digest('hex');

      try {
        const existingBadge = await db.execute({
          sql: 'SELECT * FROM user_badges WHERE user_id = ? AND badge_id = ?',
          args: [userId, badgeId]
        });

        if (existingBadge.rows.length === 0) {
          await db.execute({
            sql: `INSERT INTO user_badges (id, user_id, badge_id, badge_name, badge_category, tier, score, assessment_title, verification_hash, ledger_block_id, issuer)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [badgeDbId, userId, badgeId, badgeName, 'Practical Software Engineering', tier, evalResult.score, sandbox.title, verificationHash, ledgerBlockId, 'AICTE SkillSetu National Coding Arena']
          });
          awardedBadge = {
            id: badgeDbId,
            badge_id: badgeId,
            badge_name: badgeName,
            badge_category: 'Practical Software Engineering',
            tier,
            score: evalResult.score,
            verification_hash: verificationHash,
            ledger_block_id: ledgerBlockId,
            isNew: true
          };
        } else {
          const prev = existingBadge.rows[0] as any;
          if (evalResult.score > (prev.score || 0)) {
            await db.execute({
              sql: `UPDATE user_badges SET tier = ?, score = ?, verification_hash = ?, ledger_block_id = ?, issued_at = datetime('now') WHERE id = ?`,
              args: [tier, evalResult.score, verificationHash, ledgerBlockId, prev.id]
            });
            awardedBadge = { ...prev, tier, score: evalResult.score, verification_hash: verificationHash, isUpgrade: true };
          } else {
            awardedBadge = prev;
          }
        }
      } catch (bErr) {
        console.warn('Could not insert coding badge:', bErr);
      }

      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
        args: [
          cuid(),
          userId,
          `Coding Arena challenge completed: ${sandbox.title}! Score: ${evalResult.score}% (${evalResult.passedTests}/${evalResult.totalTests} tests passed)${awardedBadge ? ` - Awarded ${tier} Badge!` : ''}`,
          'INFO'
        ]
      });
    }

    return res.json({
      submissionId,
      status: evalResult.score >= 75 ? 'ACCEPTED' : evalResult.score >= 50 ? 'PARTIALLY_ACCEPTED' : 'FAILED',
      score: evalResult.score,
      passedTests: evalResult.passedTests,
      totalTests: evalResult.totalTests,
      testResults: evalResult.testResults,
      executionTimeMs: evalResult.executionTimeMs,
      bigOEstimate: evalResult.bigOEstimate,
      spaceEstimate: evalResult.spaceEstimate,
      codeQualityScore: evalResult.codeQualityScore,
      proctorScore,
      awardedBadge,
      blockHash,
      ledgerBlockId,
      consoleOutput: evalResult.consoleOutput
    });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message || 'Failed to submit coding challenge' });
  }
}

/**
 * AI/ML Smart Algorithmic Coaching Hints (Progressive Levels 1-3)
 */
export async function getCodingChallengeHint(req: AuthRequest, res: Response) {
  try {
    const { challengeId, hintLevel = 1 } = req.body;

    if (!challengeId) {
      return res.status(400).json({ error: 'Challenge ID is required' });
    }

    const sbResult = await db.execute({
      sql: 'SELECT title, description FROM coding_sandboxes WHERE id = ?',
      args: [challengeId]
    });

    if (sbResult.rows.length === 0) {
      return res.status(404).json({ error: 'Coding challenge not found' });
    }

    const challenge = sbResult.rows[0] as any;

    const hintsMap: Record<string, [string, string, string]> = {
      'cs-two-sum': [
        "💡 Conceptual Hint: Instead of testing every pair with a nested loop O(N²), think about what value you need to find for each number: complement = target - num.",
        "🔍 Data Structure Hint: How can you check if the complement has already been seen in O(1) time? A Hash Map (dict in Python, Map in JS) can store numbers as keys and their indices as values.",
        "🛠️ Algorithm Step: Iterate through the array once. For each element, check if (target - num) is in your map. If yes, return [map[target - num], current_index]. Otherwise, insert map[num] = current_index."
      ],
      'cs-lru-cache': [
        "💡 Conceptual Hint: An LRU cache needs two capabilities: O(1) key lookup and O(1) reordering when an item is accessed or evicted.",
        "🔍 Data Structure Hint: A Hash Map provides O(1) key lookup, but doesn't maintain order. A Doubly Linked List allows O(1) node removal and insertion if you have the node pointer. Combine both!",
        "🛠️ Algorithm Step: Keep dummy 'head' and 'tail' nodes in your doubly linked list. On get(key), move the accessed node right behind head. On put(key, val), if capacity is exceeded, remove tail.prev and delete from the hash map."
      ],
      'cs-valid-parentheses': [
        "💡 Conceptual Hint: Closing brackets must match the most recently opened bracket. This Last-In, First-Out (LIFO) order points directly to a Stack.",
        "🔍 Data Structure Hint: When encountering an opening bracket '(', '{', '[', push it onto a stack. When encountering a closing bracket, pop from the stack and verify it matches the closing bracket's pair.",
        "🛠️ Edge Cases: Check if the stack is empty before popping (returns false), and ensure the stack is completely empty at the end (no unclosed brackets)."
      ],
      'cs-merge-intervals': [
        "💡 Conceptual Hint: Before trying to merge, what order would make overlapping intervals adjacent to each other?",
        "🔍 Sorting Hint: Sort the intervals by their start time: intervals.sort(key=lambda x: x[0]). This guarantees that if interval B overlaps with interval A, start_B <= end_A.",
        "🛠️ Algorithm Step: Iterate through sorted intervals. If the current interval overlaps with the previous one (current[0] <= prev[1]), update prev[1] = max(prev[1], current[1]). Otherwise, append current as a new interval."
      ],
      'cs-rate-limiter': [
        "💡 Conceptual Hint: Token bucket stores a capacity of tokens that refills over time at a constant rate.",
        "🔍 Time Calculation: Rather than running a background timer every second, calculate tokens added dynamically upon each consume call: tokens += (currentTime - lastRefillTime) * refillRate.",
        "🛠️ Boundary Guard: Clamp tokens to bucket capacity: tokens = min(capacity, tokens). If tokens >= required, deduct and return true; else return false."
      ],
      'cs-graph-cycle': [
        "💡 Conceptual Hint: For dependency graphs (DAGs), Kahn's algorithm computes in-degrees (number of incoming edges) for all vertices.",
        "🔍 Queue Traversal: Vertices with 0 in-degree have no dependencies and can be visited first. As you visit each node, decrement in-degree for its neighbors.",
        "🛠️ Cycle Detection: If the total number of nodes visited is less than the total vertices N, the remaining nodes form a dependency cycle!"
      ],
      'cs-longest-palindrome': [
        "💡 Conceptual Hint: A palindrome mirrors around its center. A string of length N has 2N - 1 possible centers (single characters for odd lengths, between characters for even lengths).",
        "🔍 Two-Pointer Expansion: Write a helper expand(left, right) that moves outwards while s[left] == s[right] and left >= 0 and right < len(s).",
        "🛠️ Loop: For each index i from 0 to N-1, expand around (i, i) and (i, i+1). Track the maximum palindrome substring found across all iterations."
      ],
      'cs-debounce-throttle': [
        "💡 Conceptual Hint: Debouncing delays execution until a certain amount of silence has elapsed since the last call.",
        "🔍 Closure Timer: Store a timer variable in the enclosing scope: let timeoutId.",
        "🛠️ Implementation: Whenever the debounced function is invoked, clear the previous timer (clearTimeout(timeoutId)) and set a new timer (timeoutId = setTimeout(...))."
      ]
    };

    const hints = hintsMap[challengeId] || [
      "💡 Analyze the problem constraints: look for repeating operations that can be stored in memory.",
      "🔍 Check your data structures: could a Hash Map or Set optimize search time from O(N) to O(1)?",
      "🛠️ Handle edge cases: verify null inputs, single-element arrays, and negative boundary values."
    ];

    const idx = Math.min(Math.max(1, hintLevel) - 1, 2);
    const hintText = hints[idx];

    return res.json({
      hintLevel,
      maxLevel: 3,
      hint: hintText,
      challengeTitle: challenge.title
    });
  } catch (err: any) {
    console.error('Error getting coding hint:', err);
    return res.status(500).json({ error: 'Failed to generate algorithmic hint' });
  }
}
