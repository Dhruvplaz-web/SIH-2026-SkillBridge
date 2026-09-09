import { Response } from 'express';
import { db } from '../database/db';
import { AuthRequest } from '../middleware/auth';
import { cuid, calculateProfileCompletion } from '../utils/helpers';

export async function getUsers(req: AuthRequest, res: Response) {
  try {
    const { role, page = 1, limit = 20, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let sql = 'SELECT id, name, email, role, profile_image, created_at FROM users WHERE 1=1';
    const args: any[] = [];

    if (role) {
      sql += ' AND role = ?';
      args.push(role);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR email LIKE ?)';
      args.push(`%${search}%`, `%${search}%`);
    }

    const countResult = await db.execute({ sql: sql.replace('SELECT id, name, email, role, profile_image, created_at', 'SELECT COUNT(*) as count'), args });
    const total = (countResult.rows[0] as any).count;

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(Number(limit), offset);

    const result = await db.execute({ sql, args });

    return res.json({ users: result.rows, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get users' });
  }
}

export async function getUserById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const userResult = await db.execute({
      sql: 'SELECT id, name, email, role, profile_image, phone, bio, is_onboarded, created_at FROM users WHERE id = ?',
      args: [String(id)],
    });

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult.rows[0] as any;

    // Get role-specific profile
    let profile = null;
    if (user.role === 'STUDENT') {
      const spResult = await db.execute({
        sql: 'SELECT * FROM student_profiles WHERE user_id = ?',
        args: [String(id)],
      });
      if (spResult.rows.length > 0) {
        profile = spResult.rows[0];
        // Get projects and certifications
        const projects = await db.execute({ sql: 'SELECT * FROM projects WHERE student_profile_id = ?', args: [(profile as any).id] });
        const certs = await db.execute({ sql: 'SELECT * FROM certifications WHERE student_profile_id = ?', args: [(profile as any).id] });
        (profile as any).projects = projects.rows;
        (profile as any).certifications = certs.rows;
      }
    } else if (user.role === 'RECRUITER') {
      const rpResult = await db.execute({ sql: 'SELECT * FROM recruiter_profiles WHERE user_id = ?', args: [String(id)] });
      if (rpResult.rows.length > 0) profile = rpResult.rows[0];
    } else if (user.role === 'ACADEMICIAN') {
      const apResult = await db.execute({ sql: 'SELECT * FROM academician_profiles WHERE user_id = ?', args: [String(id)] });
      if (apResult.rows.length > 0) profile = apResult.rows[0];
    }

    // Get skills
    const skillsResult = await db.execute({
      sql: `SELECT us.*, s.name as skill_name, s.category 
            FROM user_skills us 
            JOIN skills s ON us.skill_id = s.id 
            WHERE us.user_id = ?`,
      args: [String(id)],
    });

    return res.json({ user, profile, skills: skillsResult.rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to get user' });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Only allow updating own profile or admin
    if (req.user!.id !== id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, phone, bio, profileImage } = req.body;

    await db.execute({
      sql: 'UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), bio = COALESCE(?, bio), profile_image = COALESCE(?, profile_image), updated_at = datetime(\'now\') WHERE id = ?',
      args: [name || null, phone || null, bio || null, profileImage || null, id],
    });

    return res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function updateStudentProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { education, branch, institution, graduationYear, cgpa, interests, careerPreferences, resumeUrl, linkedinUrl, githubUrl, portfolioUrl } = req.body;

    const existing = await db.execute({ sql: 'SELECT id FROM student_profiles WHERE user_id = ?', args: [userId] });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO student_profiles (id, user_id, education, branch, institution, graduation_year, cgpa, interests, career_preferences, resume_url, linkedin_url, github_url, portfolio_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [cuid(), userId, education, branch, institution, graduationYear, cgpa, JSON.stringify(interests || []), JSON.stringify(careerPreferences || []), resumeUrl, linkedinUrl, githubUrl, portfolioUrl],
      });
    } else {
      await db.execute({
        sql: `UPDATE student_profiles SET 
          education = COALESCE(?, education),
          branch = COALESCE(?, branch),
          institution = COALESCE(?, institution),
          graduation_year = COALESCE(?, graduation_year),
          cgpa = COALESCE(?, cgpa),
          interests = COALESCE(?, interests),
          career_preferences = COALESCE(?, career_preferences),
          resume_url = COALESCE(?, resume_url),
          linkedin_url = COALESCE(?, linkedin_url),
          github_url = COALESCE(?, github_url),
          portfolio_url = COALESCE(?, portfolio_url),
          updated_at = datetime('now')
          WHERE user_id = ?`,
        args: [education || null, branch || null, institution || null, graduationYear || null, cgpa || null, interests ? JSON.stringify(interests) : null, careerPreferences ? JSON.stringify(careerPreferences) : null, resumeUrl || null, linkedinUrl || null, githubUrl || null, portfolioUrl || null, userId],
      });
    }

    // Recalculate profile completion
    const userResult = await db.execute({ sql: 'SELECT * FROM users WHERE id = ?', args: [userId] });
    const profileResult = await db.execute({ sql: 'SELECT * FROM student_profiles WHERE user_id = ?', args: [userId] });
    const skillsResult = await db.execute({ sql: 'SELECT id FROM user_skills WHERE user_id = ?', args: [userId] });

    const completion = calculateProfileCompletion(profileResult.rows[0], userResult.rows[0], skillsResult.rows as any[]);
    await db.execute({ sql: 'UPDATE student_profiles SET profile_completion = ? WHERE user_id = ?', args: [completion, userId] });

    return res.json({ message: 'Profile updated successfully', profileCompletion: completion });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

export async function updateRecruiterProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { companyName, companySize, industry, website, location, description } = req.body;

    const existing = await db.execute({ sql: 'SELECT id FROM recruiter_profiles WHERE user_id = ?', args: [userId] });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO recruiter_profiles (id, user_id, company_name, company_size, industry, website, location, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [cuid(), userId, companyName, companySize, industry, website, location, description],
      });
    } else {
      await db.execute({
        sql: `UPDATE recruiter_profiles SET 
          company_name = COALESCE(?, company_name),
          company_size = COALESCE(?, company_size),
          industry = COALESCE(?, industry),
          website = COALESCE(?, website),
          location = COALESCE(?, location),
          description = COALESCE(?, description),
          updated_at = datetime('now')
          WHERE user_id = ?`,
        args: [companyName || null, companySize || null, industry || null, website || null, location || null, description || null, userId],
      });
    }

    return res.json({ message: 'Company profile updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update company profile' });
  }
}

export async function updateAcademicianProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { institution, department, designation, specialization, researchAreas, experience } = req.body;

    const existing = await db.execute({ sql: 'SELECT id FROM academician_profiles WHERE user_id = ?', args: [userId] });

    if (existing.rows.length === 0) {
      await db.execute({
        sql: 'INSERT INTO academician_profiles (id, user_id, institution, department, designation, specialization, research_areas, experience) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        args: [cuid(), userId, institution, department, designation, specialization, JSON.stringify(researchAreas || []), experience],
      });
    } else {
      await db.execute({
        sql: `UPDATE academician_profiles SET 
          institution = COALESCE(?, institution),
          department = COALESCE(?, department),
          designation = COALESCE(?, designation),
          specialization = COALESCE(?, specialization),
          research_areas = COALESCE(?, research_areas),
          experience = COALESCE(?, experience),
          updated_at = datetime('now')
          WHERE user_id = ?`,
        args: [institution || null, department || null, designation || null, specialization || null, researchAreas ? JSON.stringify(researchAreas) : null, experience || null, userId],
      });
    }

    return res.json({ message: 'Academician profile updated' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
}

// Portfolio management
export async function addProject(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, description, technologies, liveUrl, githubUrl, startDate, endDate } = req.body;

    const spResult = await db.execute({ sql: 'SELECT id FROM student_profiles WHERE user_id = ?', args: [userId] });
    if (spResult.rows.length === 0) return res.status(404).json({ error: 'Student profile not found' });

    const projectId = cuid();
    await db.execute({
      sql: 'INSERT INTO projects (id, student_profile_id, title, description, technologies, live_url, github_url, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [projectId, (spResult.rows[0] as any).id, title, description, JSON.stringify(technologies || []), liveUrl, githubUrl, startDate, endDate],
    });

    return res.status(201).json({ message: 'Project added', id: projectId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add project' });
  }
}

export async function updateProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    const { title, description, technologies, liveUrl, githubUrl, startDate, endDate } = req.body;

    await db.execute({
      sql: `UPDATE projects SET title = COALESCE(?, title), description = COALESCE(?, description), technologies = COALESCE(?, technologies), live_url = COALESCE(?, live_url), github_url = COALESCE(?, github_url), start_date = COALESCE(?, start_date), end_date = COALESCE(?, end_date) WHERE id = ?`,
      args: [title || null, description || null, technologies ? JSON.stringify(technologies) : null, liveUrl || null, githubUrl || null, startDate || null, endDate || null, projectId],
    });

    return res.json({ message: 'Project updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function deleteProject(req: AuthRequest, res: Response) {
  try {
    const { projectId } = req.params;
    await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [String(projectId)] });
    return res.json({ message: 'Project deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

export async function addCertification(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { title, issuer, issueDate, expiryDate, credentialUrl, credentialId } = req.body;

    const spResult = await db.execute({ sql: 'SELECT id FROM student_profiles WHERE user_id = ?', args: [userId] });
    if (spResult.rows.length === 0) return res.status(404).json({ error: 'Student profile not found' });

    const certId = cuid();
    await db.execute({
      sql: 'INSERT INTO certifications (id, student_profile_id, title, issuer, issue_date, expiry_date, credential_url, credential_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [certId, (spResult.rows[0] as any).id, title, issuer, issueDate, expiryDate, credentialUrl, credentialId],
    });

    return res.status(201).json({ message: 'Certification added', id: certId });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to add certification' });
  }
}

export async function deleteCertification(req: AuthRequest, res: Response) {
  try {
    const { certId } = req.params;
    await db.execute({ sql: 'DELETE FROM certifications WHERE id = ?', args: [String(certId)] });
    return res.json({ message: 'Certification deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete certification' });
  }
}
