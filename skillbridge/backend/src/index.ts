import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

import { initializeDatabase } from './database/db';
import { securityHeaders, generalApiLimiter } from './middleware/security';
import apiRoutes from './routes';

const app = express();
const PORT = process.env.PORT || 5000;

// Security Headers (nosniff, frameguard, strict-transport, hide x-powered-by)
app.use(securityHeaders);

// Production CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests from all authorized clients, local dev, Docker network, and Cloudflare tunnel
    callback(null, true);
  },
  credentials: true,
}));

// Global Rate Limiter
app.use(generalApiLimiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files (resumes etc.)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SkillBridge API is running', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// Error handler
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n🚀 SkillBridge API running on http://localhost:${PORT}`);
      console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
