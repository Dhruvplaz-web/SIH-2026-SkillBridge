import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../database/db';
import { cuid } from '../utils/helpers';
import { AuthRequest } from '../middleware/auth';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['STUDENT', 'ACADEMICIAN', 'RECRUITER', 'ADMIN'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Check existing user
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = cuid();

    await db.execute({
      sql: 'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      args: [userId, name, email.toLowerCase(), passwordHash, role],
    });

    // Create role-specific profile
    if (role === 'STUDENT') {
      await db.execute({
        sql: 'INSERT INTO student_profiles (id, user_id) VALUES (?, ?)',
        args: [cuid(), userId],
      });
    } else if (role === 'RECRUITER') {
      await db.execute({
        sql: 'INSERT INTO recruiter_profiles (id, user_id) VALUES (?, ?)',
        args: [cuid(), userId],
      });
    } else if (role === 'ACADEMICIAN') {
      await db.execute({
        sql: 'INSERT INTO academician_profiles (id, user_id) VALUES (?, ?)',
        args: [cuid(), userId],
      });
    }

    const secret = process.env.JWT_SECRET || 'skillbridge-secret';
    const token = jwt.sign({ userId, role }, secret, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: { id: userId, name, email: email.toLowerCase(), role },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email.toLowerCase()],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0] as any;
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const secret = process.env.JWT_SECRET || 'skillbridge-secret';
    const token = jwt.sign({ userId: user.id, role: user.role }, secret, { expiresIn: '7d' });

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profile_image,
        is_onboarded: Boolean(user.is_onboarded),
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function getMe(req: AuthRequest, res: Response) {
  try {
    const result = await db.execute({
      sql: 'SELECT id, name, email, role, profile_image, phone, bio, is_onboarded, created_at FROM users WHERE id = ?',
      args: [req.user!.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0] as any;
    user.is_onboarded = Boolean(user.is_onboarded);
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get user data' });
  }
}
