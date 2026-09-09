import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid } from '../utils/helpers';

export async function requestMentorship(req: AuthRequest, res: Response) {
  try {
    const studentId = req.user!.id;
    const { mentorId, message, topic } = req.body;

    if (!mentorId) return res.status(400).json({ error: 'Mentor ID required' });

    // Check mentor exists
    const mentor = await db.execute({ sql: 'SELECT id, name FROM users WHERE id = ? AND role IN (\'ACADEMICIAN\', \'RECRUITER\')', args: [mentorId] });
    if (mentor.rows.length === 0) return res.status(404).json({ error: 'Mentor not found' });

    const id = cuid();
    await db.execute({
      sql: 'INSERT INTO mentorship_requests (id, student_id, mentor_id, message, topic) VALUES (?, ?, ?, ?, ?)',
      args: [id, studentId, mentorId, message || '', topic || ''],
    });

    // Notify mentor
    const mentorUser = mentor.rows[0] as any;
    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), mentorId, `New mentorship request from a student on topic: "${topic || 'General Guidance'}"`, 'MENTORSHIP'],
    });

    return res.status(201).json({ message: 'Mentorship request sent', id });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send mentorship request' });
  }
}

export async function getMyMentorshipRequests(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let result;
    if (role === 'STUDENT') {
      result = await db.execute({
        sql: `SELECT mr.*, u.name as mentor_name, u.email as mentor_email, 
                     CASE u.role 
                       WHEN 'ACADEMICIAN' THEN ap.designation
                       ELSE NULL
                     END as mentor_designation,
                     CASE u.role 
                       WHEN 'ACADEMICIAN' THEN ap.institution
                       WHEN 'RECRUITER' THEN rp.company_name
                     END as mentor_organization
              FROM mentorship_requests mr
              JOIN users u ON mr.mentor_id = u.id
              LEFT JOIN academician_profiles ap ON ap.user_id = u.id
              LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
              WHERE mr.student_id = ?
              ORDER BY mr.created_at DESC`,
        args: [userId],
      });
    } else {
      result = await db.execute({
        sql: `SELECT mr.*, u.name as student_name, u.email as student_email,
                     sp.institution, sp.branch, sp.education, sp.cgpa
              FROM mentorship_requests mr
              JOIN users u ON mr.student_id = u.id
              LEFT JOIN student_profiles sp ON sp.user_id = u.id
              WHERE mr.mentor_id = ?
              ORDER BY mr.created_at DESC`,
        args: [userId],
      });
    }

    return res.json({ requests: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get mentorship requests' });
  }
}

export async function updateMentorshipStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const mentorId = req.user!.id;

    const validStatuses = ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await db.execute({
      sql: 'SELECT * FROM mentorship_requests WHERE id = ?',
      args: [id],
    });

    if (request.rows.length === 0) return res.status(404).json({ error: 'Request not found' });

    const req_data = request.rows[0] as any;
    if (req_data.mentor_id !== mentorId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await db.execute({
      sql: 'UPDATE mentorship_requests SET status = ?, updated_at = datetime(\'now\') WHERE id = ?',
      args: [status, id],
    });

    const statusMessages: Record<string, string> = {
      ACCEPTED: `Your mentorship request on "${req_data.topic || 'General Guidance'}" has been accepted!`,
      REJECTED: `Your mentorship request on "${req_data.topic || 'General Guidance'}" could not be accommodated at this time.`,
      COMPLETED: `Your mentorship session on "${req_data.topic || 'General Guidance'}" has been marked as completed.`,
    };

    if (statusMessages[status]) {
      await db.execute({
        sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
        args: [cuid(), req_data.student_id, statusMessages[status], 'MENTORSHIP'],
      });
    }

    return res.json({ message: 'Mentorship status updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update mentorship status' });
  }
}

export async function getMentors(req: AuthRequest, res: Response) {
  try {
    const result = await db.execute({
      sql: `SELECT u.id, u.name, u.bio, u.profile_image, u.role,
                   ap.institution, ap.department, ap.designation, ap.specialization, ap.research_areas, ap.experience,
                   rp.company_name, rp.industry
            FROM users u
            LEFT JOIN academician_profiles ap ON ap.user_id = u.id
            LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
            WHERE u.role IN ('ACADEMICIAN', 'RECRUITER')
            ORDER BY u.name`,
      args: [],
    });

    return res.json({ mentors: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get mentors' });
  }
}

export async function getCollaborations(req: AuthRequest, res: Response) {
  try {
    const result = await db.execute({
      sql: `SELECT c.*, u.name as creator_name,
                   CASE u.role WHEN 'ACADEMICIAN' THEN ap.institution ELSE rp.company_name END as organization
            FROM collaborations c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN academician_profiles ap ON ap.user_id = u.id
            LEFT JOIN recruiter_profiles rp ON rp.user_id = u.id
            WHERE c.status = 'OPEN'
            ORDER BY c.created_at DESC`,
      args: [],
    });

    return res.json({ collaborations: result.rows });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get collaborations' });
  }
}

export async function createCollaboration(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, description, type, deadline } = req.body;

    if (!title || !description || !type) {
      return res.status(400).json({ error: 'Title, description and type required' });
    }

    const id = cuid();
    await db.execute({
      sql: 'INSERT INTO collaborations (id, user_id, title, description, type, deadline) VALUES (?, ?, ?, ?, ?, ?)',
      args: [id, userId, title, description, type, deadline || null],
    });

    return res.status(201).json({ message: 'Collaboration created', id });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to create collaboration' });
  }
}

// ─── Mentorship Chat Messages ───────────────────────────────────────────────

export async function getMessages(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const userId = req.user!.id;

    // Verify the caller is either the student or the mentor in this request
    const mr = await db.execute({
      sql: 'SELECT * FROM mentorship_requests WHERE id = ?',
      args: [requestId],
    });
    if (mr.rows.length === 0) return res.status(404).json({ error: 'Mentorship request not found' });

    const record = mr.rows[0] as any;
    if (record.student_id !== userId && record.mentor_id !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await db.execute({
      sql: `SELECT mm.*, u.name as sender_name, u.role as sender_role
            FROM mentorship_messages mm
            JOIN users u ON mm.sender_id = u.id
            WHERE mm.mentorship_request_id = ?
            ORDER BY mm.created_at ASC`,
      args: [requestId],
    });

    return res.json({
      messages: messages.rows,
      mentorshipRequest: record,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get messages' });
  }
}

export async function sendMessage(req: AuthRequest, res: Response) {
  try {
    const { requestId } = req.params;
    const { message } = req.body;
    const senderId = req.user!.id;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    // Verify the caller is either the student or the mentor in this request
    const mr = await db.execute({
      sql: 'SELECT * FROM mentorship_requests WHERE id = ?',
      args: [requestId],
    });
    if (mr.rows.length === 0) return res.status(404).json({ error: 'Mentorship request not found' });

    const record = mr.rows[0] as any;
    if (record.student_id !== senderId && record.mentor_id !== senderId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (record.status === 'REJECTED') {
      return res.status(400).json({ error: 'Cannot send messages — this mentorship request was declined' });
    }

    const msgId = cuid();
    await db.execute({
      sql: 'INSERT INTO mentorship_messages (id, mentorship_request_id, sender_id, message) VALUES (?, ?, ?, ?)',
      args: [msgId, requestId, senderId, message.trim()],
    });

    // Notify the other party
    const recipientId = senderId === record.student_id ? record.mentor_id : record.student_id;
    const senderResult = await db.execute({ sql: 'SELECT name FROM users WHERE id = ?', args: [senderId] });
    const senderName = (senderResult.rows[0] as any)?.name || 'Someone';

    await db.execute({
      sql: 'INSERT INTO notifications (id, user_id, message, type) VALUES (?, ?, ?, ?)',
      args: [cuid(), recipientId, `New message from ${senderName} on "${record.topic || 'Mentorship'}"`, 'MENTORSHIP'],
    });

    // Fetch the newly created message with sender info to return
    const newMsg = await db.execute({
      sql: `SELECT mm.*, u.name as sender_name, u.role as sender_role
            FROM mentorship_messages mm
            JOIN users u ON mm.sender_id = u.id
            WHERE mm.id = ?`,
      args: [msgId],
    });

    return res.status(201).json({ message: 'Message sent', data: newMsg.rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to send message' });
  }
}
