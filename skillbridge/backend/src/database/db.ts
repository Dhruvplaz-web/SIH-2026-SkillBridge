import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(__dirname, '../../prisma/dev.db');

// Ensure directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const rawDb = createClient({
  url: `file:${dbPath}`,
});

export const db = {
  ...rawDb,
  execute: (stmt: any) => rawDb.execute(stmt),
  executeMultiple: (sql: string) => rawDb.executeMultiple(sql),
  transaction: (mode?: any) => rawDb.transaction(mode),
  batch: (stmts: any, mode?: any) => rawDb.batch(stmts, mode),
  close: () => rawDb.close(),
};

export async function initializeDatabase() {
  console.log('Initializing database...');
  
  await db.executeMultiple(`
    PRAGMA journal_mode=WAL;
    PRAGMA foreign_keys=ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'STUDENT',
      profile_image TEXT,
      phone TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      education TEXT,
      branch TEXT,
      institution TEXT,
      graduation_year INTEGER,
      cgpa REAL,
      interests TEXT,
      career_preferences TEXT,
      resume_url TEXT,
      linkedin_url TEXT,
      github_url TEXT,
      portfolio_url TEXT,
      profile_completion INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recruiter_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      company_name TEXT,
      company_size TEXT,
      industry TEXT,
      website TEXT,
      location TEXT,
      description TEXT,
      verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS academician_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      institution TEXT,
      department TEXT,
      designation TEXT,
      specialization TEXT,
      research_areas TEXT,
      experience INTEGER,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      student_profile_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      technologies TEXT,
      live_url TEXT,
      github_url TEXT,
      start_date TEXT,
      end_date TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS certifications (
      id TEXT PRIMARY KEY,
      student_profile_id TEXT NOT NULL,
      title TEXT NOT NULL,
      issuer TEXT,
      issue_date TEXT,
      expiry_date TEXT,
      credential_url TEXT,
      credential_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_profile_id) REFERENCES student_profiles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS user_skills (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      proficiency TEXT NOT NULL DEFAULT 'BEGINNER',
      assessment_score INTEGER,
      verified INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(user_id, skill_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT NOT NULL,
      difficulty TEXT DEFAULT 'BEGINNER',
      duration INTEGER,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      assessment_id TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correct_answer INTEGER NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'BEGINNER',
      points INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_results (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      assessment_id TEXT NOT NULL,
      score INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      percentage REAL NOT NULL,
      proficiency TEXT NOT NULL,
      answers TEXT NOT NULL,
      tab_switches INTEGER DEFAULT 0,
      integrity_score INTEGER DEFAULT 100,
      proctor_status TEXT DEFAULT 'CLEAN',
      completed_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS user_badges (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      badge_id TEXT NOT NULL,
      badge_name TEXT NOT NULL,
      badge_category TEXT NOT NULL,
      tier TEXT NOT NULL DEFAULT 'GOLD',
      score INTEGER NOT NULL,
      assessment_title TEXT NOT NULL,
      verification_hash TEXT NOT NULL,
      ledger_block_id TEXT,
      issuer TEXT DEFAULT 'SkillSetu National Accreditation Council (AICTE/NCVET)',
      issued_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS opportunities (
      id TEXT PRIMARY KEY,
      recruiter_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      location TEXT,
      location_type TEXT DEFAULT 'ONSITE',
      duration TEXT,
      stipend TEXT,
      salary_range TEXT,
      deadline TEXT,
      eligibility TEXT,
      requirements TEXT,
      responsibilities TEXT,
      benefits TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (recruiter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS opportunity_skills (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      importance TEXT DEFAULT 'REQUIRED',
      UNIQUE(opportunity_id, skill_id),
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      match_score REAL,
      status TEXT DEFAULT 'APPLIED',
      cover_letter TEXT,
      resume_url TEXT,
      resume_filename TEXT,
      notes TEXT,
      applied_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, opportunity_id),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS training_programs (
      id TEXT PRIMARY KEY,
      created_by_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      level TEXT DEFAULT 'BEGINNER',
      duration TEXT,
      provider TEXT,
      external_url TEXT,
      category TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (created_by_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS training_skills (
      id TEXT PRIMARY KEY,
      training_program_id TEXT NOT NULL,
      skill_id TEXT NOT NULL,
      UNIQUE(training_program_id, skill_id),
      FOREIGN KEY (training_program_id) REFERENCES training_programs(id) ON DELETE CASCADE,
      FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      training_program_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      completed_at TEXT,
      enrolled_at TEXT DEFAULT (datetime('now')),
      UNIQUE(student_id, training_program_id),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (training_program_id) REFERENCES training_programs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mentorship_requests (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      mentor_id TEXT NOT NULL,
      status TEXT DEFAULT 'PENDING',
      message TEXT,
      topic TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (mentor_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      link TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collaborations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT DEFAULT 'OPEN',
      deadline TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mentorship_messages (
      id TEXT PRIMARY KEY,
      mentorship_request_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (mentorship_request_id) REFERENCES mentorship_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS trust_ledger_blocks (
      id TEXT PRIMARY KEY,
      block_hash TEXT NOT NULL UNIQUE,
      student_name TEXT NOT NULL,
      skill_name TEXT NOT NULL,
      endorser TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'verified',
      metadata TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      issuer TEXT NOT NULL,
      issue_date TEXT,
      credential_id TEXT,
      file_url TEXT,
      verification_status TEXT NOT NULL DEFAULT 'PENDING_AUDIT',
      confidence_score INTEGER DEFAULT 0,
      tamper_flags TEXT,
      block_hash TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS bounties (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      company TEXT NOT NULL,
      stipend TEXT NOT NULL,
      duration TEXT NOT NULL,
      description TEXT,
      required_skills TEXT,
      stream TEXT DEFAULT 'tech',
      status TEXT DEFAULT 'OPEN',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS teammate_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      college TEXT,
      hackathon_name TEXT NOT NULL,
      project_title TEXT NOT NULL,
      description TEXT,
      needed_skills TEXT NOT NULL,
      contact_email TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mock_interviews (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_role TEXT NOT NULL,
      technical_score INTEGER DEFAULT 0,
      keyword_coverage INTEGER DEFAULT 0,
      clarity_score INTEGER DEFAULT 0,
      overall_score INTEGER DEFAULT 0,
      feedback TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- RECRUITER SUITE
    CREATE TABLE IF NOT EXISTS coding_sandboxes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      language TEXT NOT NULL,
      difficulty TEXT NOT NULL DEFAULT 'INTERMEDIATE',
      description TEXT NOT NULL,
      starter_code TEXT NOT NULL,
      test_cases TEXT NOT NULL,
      created_by_id TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS coding_submissions (
      id TEXT PRIMARY KEY,
      sandbox_id TEXT NOT NULL,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      code TEXT NOT NULL,
      passed_tests INTEGER DEFAULT 0,
      total_tests INTEGER DEFAULT 0,
      execution_time_ms INTEGER DEFAULT 0,
      proctor_score INTEGER DEFAULT 100,
      tab_switches INTEGER DEFAULT 0,
      status TEXT DEFAULT 'COMPLETED',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS letters_of_intent (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      recruiter_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      opportunity_id TEXT,
      role_title TEXT NOT NULL,
      stipend TEXT NOT NULL,
      start_date TEXT NOT NULL,
      loi_hash TEXT NOT NULL,
      status TEXT DEFAULT 'MINTED_ON_LEDGER',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS campus_interviews (
      id TEXT PRIMARY KEY,
      candidate_id TEXT NOT NULL,
      candidate_name TEXT NOT NULL,
      candidate_email TEXT,
      recruiter_id TEXT NOT NULL,
      company_name TEXT NOT NULL,
      college_name TEXT NOT NULL,
      role_title TEXT NOT NULL,
      round_type TEXT NOT NULL,
      scheduled_time TEXT NOT NULL,
      meeting_link TEXT NOT NULL,
      status TEXT DEFAULT 'CONFIRMED',
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ACADEMICIAN SUITE
    CREATE TABLE IF NOT EXISTS curriculum_audits (
      id TEXT PRIMARY KEY,
      academician_id TEXT NOT NULL,
      course_title TEXT NOT NULL,
      syllabus_text TEXT,
      missing_skills TEXT,
      outdated_topics TEXT,
      industry_match_pct INTEGER DEFAULT 65,
      recommendations TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS corporate_consultancies (
      id TEXT PRIMARY KEY,
      company_name TEXT NOT NULL,
      title TEXT NOT NULL,
      domain TEXT NOT NULL,
      bottleneck_description TEXT NOT NULL,
      budget TEXT NOT NULL,
      deadline TEXT NOT NULL,
      bids_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'OPEN',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS consultancy_bids (
      id TEXT PRIMARY KEY,
      consultancy_id TEXT NOT NULL,
      academician_id TEXT NOT NULL,
      faculty_name TEXT NOT NULL,
      institution TEXT NOT NULL,
      proposal_summary TEXT NOT NULL,
      quoted_budget TEXT NOT NULL,
      duration_weeks INTEGER NOT NULL,
      student_slots INTEGER DEFAULT 2,
      status TEXT DEFAULT 'PENDING_REVIEW',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS guest_lectures (
      id TEXT PRIMARY KEY,
      university_id TEXT NOT NULL,
      university_name TEXT NOT NULL,
      topic TEXT NOT NULL,
      speaker_name TEXT NOT NULL,
      speaker_company TEXT NOT NULL,
      speaker_designation TEXT,
      scheduled_date TEXT NOT NULL,
      mode TEXT DEFAULT 'Virtual / Google Meet',
      status TEXT DEFAULT 'CONFIRMED',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS capstone_projects (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      student_team TEXT NOT NULL,
      academic_advisor TEXT NOT NULL,
      industry_mentor TEXT NOT NULL,
      company TEXT NOT NULL,
      domain TEXT NOT NULL,
      repo_url TEXT,
      status TEXT DEFAULT 'IN_PROGRESS',
      endorsement_hash TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- ADMIN & REGULATORY SUITE
    CREATE TABLE IF NOT EXISTS skill_shortage_forecasts (
      id TEXT PRIMARY KEY,
      domain TEXT NOT NULL,
      current_demand_index INTEGER NOT NULL,
      projected_deficit_pct INTEGER NOT NULL,
      risk_level TEXT NOT NULL,
      timeline TEXT NOT NULL,
      key_skills TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS digilocker_abc_records (
      id TEXT PRIMARY KEY,
      student_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      abc_account_id TEXT NOT NULL,
      total_credits REAL DEFAULT 0,
      verified_internship_hours INTEGER DEFAULT 0,
      test_badges_count INTEGER DEFAULT 0,
      sync_status TEXT DEFAULT 'SYNCED_NEP_2020',
      last_synced_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS job_fraud_audits (
      id TEXT PRIMARY KEY,
      opportunity_id TEXT,
      company_name TEXT NOT NULL,
      job_title TEXT NOT NULL,
      risk_score INTEGER DEFAULT 10,
      fraud_flags TEXT,
      blacklisted INTEGER DEFAULT 0,
      status TEXT DEFAULT 'CLEARED',
      audited_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS regional_skilling_grants (
      id TEXT PRIMARY KEY,
      state_name TEXT NOT NULL,
      tier3_colleges_count INTEGER NOT NULL,
      talent_deficit_pct INTEGER NOT NULL,
      recommended_grant_amount TEXT NOT NULL,
      priority_focus TEXT NOT NULL,
      status TEXT DEFAULT 'APPROVED_BY_COMMITTEE',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Safe migrations - ignore errors for already-existing columns
  const safeMigrations = [
    'ALTER TABLE applications ADD COLUMN resume_url TEXT',
    'ALTER TABLE applications ADD COLUMN resume_filename TEXT',
    'ALTER TABLE applications ADD COLUMN transaction_hash TEXT',
    'ALTER TABLE users ADD COLUMN is_onboarded INTEGER DEFAULT 1',
    'ALTER TABLE student_profiles ADD COLUMN active_stream TEXT DEFAULT "tech"',
    'ALTER TABLE student_profiles ADD COLUMN github_telemetry TEXT',
    'ALTER TABLE opportunities ADD COLUMN requisition_type TEXT DEFAULT "Full-Time / Co-Op"',
    'ALTER TABLE opportunities ADD COLUMN skill_weights TEXT',
    'ALTER TABLE assessment_results ADD COLUMN tab_switches INTEGER DEFAULT 0',
    'ALTER TABLE assessment_results ADD COLUMN integrity_score INTEGER DEFAULT 100',
    'ALTER TABLE assessment_results ADD COLUMN proctor_status TEXT DEFAULT "CLEAN"',
  ];
  for (const sql of safeMigrations) {
    try { await db.execute({ sql, args: [] }); } catch (_) { /* column already exists */ }
  }

  // Seed default TrustLedger blocks if empty
  try {
    const blockCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM trust_ledger_blocks', args: [] });
    if ((blockCount.rows[0] as any).count === 0) {
      const initialBlocks = [
        { id: 'BLK-9482', hash: '0x8f2a9d4c1b5e3f7a0c8b2d4e6f8a0b2c4d6e8f0a2b4c6d8e0f2a4b6c8d0e2f4a', student: 'Aarav Patel', skill: 'Python Distributed Systems', endorser: 'IIT Delhi', timestamp: '2 mins ago', status: 'verified' },
        { id: 'BLK-9481', hash: '0x7b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3a5b7c9d1e3f5a7b9c1d3e5f7a9b1c', student: 'Priya Sharma', skill: 'React Native Microfrontends', endorser: 'TCS Innovation Lab', timestamp: '15 mins ago', status: 'verified' },
        { id: 'BLK-9480', hash: '0x3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f', student: 'Rahul Kumar', skill: 'AWS Cloud Solutions Architecture', endorser: 'Amazon Web Services', timestamp: '1 hour ago', status: 'verified' },
        { id: 'BLK-9479', hash: '0x9d8c7b6a5e4d3c2b1a0f9e8d7c6b5a4e3d2c1b0a9f8e7d6c5b4a3e2d1c0b9a8f', student: 'Anjali Desai', skill: 'Docker & Kubernetes Orchestration', endorser: 'Infosys Training Cell', timestamp: '3 hours ago', status: 'verified' },
        { id: 'BLK-9478', hash: '0x4c2b9a7f8e1d3c5b7a9f0e2d4c6b8a0f2e4d6c8b0a2f4e6d8c0b2a4f6e8d0c2b', student: 'Dr. Vikramaditya', skill: 'Ayush Clinical FHIR R4 & EHR Standards', endorser: 'Ministry of Ayush / AIIMS', timestamp: '5 hours ago', status: 'verified' }
      ];
      for (const b of initialBlocks) {
        await db.execute({
          sql: 'INSERT INTO trust_ledger_blocks (id, block_hash, student_name, skill_name, endorser, timestamp, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [b.id, b.hash, b.student, b.skill, b.endorser, b.timestamp, b.status]
        });
      }
    }

    const bountyCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM bounties', args: [] });
    if ((bountyCount.rows[0] as any).count === 0) {
      const initialBounties = [
        { id: 'bty-1', title: 'FHIR JSON Parser Microservice', company: 'Ayushman Bharat Digital Hub', stipend: '₹25,000 / milestone', duration: '2 Weeks', description: 'Implement an HL7 FHIR v4 to JSON-LD translator with 99% test coverage.', required_skills: 'Python, FHIR, REST APIs', stream: 'medical' },
        { id: 'bty-2', title: 'Zero-Trust mTLS Ingress Gateway', company: 'Sovereign Cloud India', stipend: '₹35,000 / milestone', duration: '3 Weeks', description: 'Build an Envoy proxy extension enforcing hardware attestation for Kubernetes clusters.', required_skills: 'Docker, Go, Kubernetes, Security', stream: 'tech' },
        { id: 'bty-3', title: 'Ayush Herb Standard Herbal Classifier', company: 'National Medicinal Plants Board', stipend: '₹20,000 / milestone', duration: '2 Weeks', description: 'Train a lightweight MobileNet model to identify 12 classical Ayurvedic raw herbs.', required_skills: 'Computer Vision, PyTorch, Pharmacognosy', stream: 'medical' },
        { id: 'bty-4', title: 'React Real-Time Match Radar Visualizer', company: 'TechCorp India', stipend: '₹18,000 / milestone', duration: '10 Days', description: 'Create an accessible, animated 6-axis radar polygon with SVG export.', required_skills: 'React, Recharts, Tailwind CSS', stream: 'tech' }
      ];
      for (const b of initialBounties) {
        await db.execute({
          sql: 'INSERT INTO bounties (id, title, company, stipend, duration, description, required_skills, stream) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [b.id, b.title, b.company, b.stipend, b.duration, b.description, b.required_skills, b.stream]
        });
      }
    }

    // Seed default Coding Sandboxes
    const sandboxCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM coding_sandboxes', args: [] });
    if ((sandboxCount.rows[0] as any).count === 0) {
      const initialSandboxes = [
        {
          id: 'sbx-1',
          title: 'Distributed Transaction Idempotency Filter',
          language: 'python',
          difficulty: 'HARD',
          description: 'Implement a function `process_payment(transaction_id: str, amount: float, cache: dict) -> dict` that guarantees at-most-once processing. If transaction_id already exists in cache, return status: "CACHED_DUPLICATE". Otherwise calculate processing fee (2.5%), store in cache, and return status: "APPROVED".',
          starter_code: 'def process_payment(transaction_id: str, amount: float, cache: dict) -> dict:\n    # Write your solution here\n    pass\n',
          test_cases: JSON.stringify([
            { input: '["tx_101", 1000.0, {}]', expected: '{"status": "APPROVED", "net_amount": 1025.0}' },
            { input: '["tx_101", 1000.0, {"tx_101": {"status": "APPROVED"}}]', expected: '{"status": "CACHED_DUPLICATE"}' }
          ])
        },
        {
          id: 'sbx-2',
          title: 'Async Rate Limiter Token Bucket',
          language: 'javascript',
          difficulty: 'MEDIUM',
          description: 'Create a JavaScript class `TokenBucket` with `consume(tokens)` that tracks token replenishment based on capacity (max 10) and refill rate (2 tokens/sec).',
          starter_code: 'class TokenBucket {\n  constructor(capacity = 10, refillRate = 2) {\n    this.capacity = capacity;\n    this.tokens = capacity;\n    this.refillRate = refillRate;\n  }\n  consume(tokens) {\n    // Implement token deduction\n    return true;\n  }\n}\n',
          test_cases: JSON.stringify([
            { input: 'consume(5)', expected: 'true' },
            { input: 'consume(6)', expected: 'false' }
          ])
        },
        {
          id: 'sbx-3',
          title: 'Optimized Multi-Index SQL Aggregator',
          language: 'sql',
          difficulty: 'MEDIUM',
          description: 'Write an ANSI SQL query to find the top 3 highest spending students per academic institution with ranking partition.',
          starter_code: 'SELECT institution, student_name, total_spent,\n       DENSE_RANK() OVER (PARTITION BY institution ORDER BY total_spent DESC) as rank\nFROM student_spending\nWHERE rank <= 3;\n',
          test_cases: JSON.stringify([
            { input: 'RUN QUERY', expected: '3 rows per partition' }
          ])
        }
      ];
      for (const sb of initialSandboxes) {
        await db.execute({
          sql: 'INSERT INTO coding_sandboxes (id, title, language, difficulty, description, starter_code, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?)',
          args: [sb.id, sb.title, sb.language, sb.difficulty, sb.description, sb.starter_code, sb.test_cases]
        });
      }
    }

    // Seed default Corporate Consultancies
    const consultCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM corporate_consultancies', args: [] });
    if ((consultCount.rows[0] as any).count === 0) {
      const initialConsultancies = [
        {
          id: 'cst-1',
          company_name: 'Bharat Electronics Ltd (BEL)',
          title: 'FPGA Hardware Acceleration for Radar Signal Processing',
          domain: 'Semiconductor VLSI & Embedded Systems',
          bottleneck_description: 'We require university research faculty to optimize FFT calculation latency on Xilinx UltraScale+ FPGAs for naval phased-array radars. Seeking 40% reduction in gate count.',
          budget: '₹18,50,000',
          deadline: '30 Oct 2026',
          bids_count: 2
        },
        {
          id: 'cst-2',
          company_name: 'Tata Consultancy Services Research',
          title: 'Differential Privacy for Multi-Hospital FHIR Patient Registries',
          domain: 'Healthcare AI & Ayush Informatics',
          bottleneck_description: 'Need mathematical verification and ε-differential privacy bounds for federated learning across 14 Ayurvedic clinical research centers.',
          budget: '₹12,00,000',
          deadline: '15 Nov 2026',
          bids_count: 3
        },
        {
          id: 'cst-3',
          company_name: 'Adani Green Energy Labs',
          title: 'Edge AI Anomaly Detection in High-Voltage Solar Inverters',
          domain: 'IoT & Clean Energy Grid',
          bottleneck_description: 'Deploy tinyML models on ARM Cortex-M4 microcontrollers to identify harmonic distortion before transformer failure.',
          budget: '₹15,00,000',
          deadline: '10 Dec 2026',
          bids_count: 1
        }
      ];
      for (const c of initialConsultancies) {
        await db.execute({
          sql: 'INSERT INTO corporate_consultancies (id, company_name, title, domain, bottleneck_description, budget, deadline, bids_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [c.id, c.company_name, c.title, c.domain, c.bottleneck_description, c.budget, c.deadline, c.bids_count]
        });
      }
    }

    // Seed default Skill Shortage Forecasts
    const forecastCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM skill_shortage_forecasts', args: [] });
    if ((forecastCount.rows[0] as any).count === 0) {
      const initialForecasts = [
        {
          id: 'fc-1',
          domain: 'Semiconductor VLSI & Chip Design',
          current_demand_index: 94,
          projected_deficit_pct: 68,
          risk_level: 'CRITICAL',
          timeline: '2026 – 2028',
          key_skills: 'Verilog, SystemVerilog, UVM, Physical Design, FinFET Fabrication',
          recommended_action: 'Subsidize cleanroom EDA tools (Cadence, Synopsys) in Tier-2 engineering colleges under India Semiconductor Mission (ISM).'
        },
        {
          id: 'fc-2',
          domain: 'Post-Quantum Cryptography & Cloud Security',
          current_demand_index: 88,
          projected_deficit_pct: 54,
          risk_level: 'HIGH',
          timeline: '2026 – 2029',
          key_skills: 'Lattice Cryptography, NIST FIPS 203/204, Zero-Trust Architecture, eBPF',
          recommended_action: 'Mandate Quantum-Resistant algorithm modules in AICTE Model Curriculum Semester 6.'
        },
        {
          id: 'fc-3',
          domain: 'Ayush Digital Health & Clinical FHIR Informatics',
          current_demand_index: 82,
          projected_deficit_pct: 49,
          risk_level: 'HIGH',
          timeline: '2026 – 2028',
          key_skills: 'HL7 FHIR R4, SNOMED-CT (Ayurveda Extensions), EHR Integration, HIPAA/DPDP',
          recommended_action: 'Launch Joint B.Tech/BAMS Dual Certification programs with Ministry of Ayush & AIIMS.'
        },
        {
          id: 'fc-4',
          domain: 'Edge AI & Autonomous Drone Telemetry',
          current_demand_index: 91,
          projected_deficit_pct: 62,
          risk_level: 'CRITICAL',
          timeline: '2026 – 2027',
          key_skills: 'TinyML, ROS2, TensorRT, C++, Drone Sensor Fusion, RTK-GPS',
          recommended_action: 'Deploy Drone Pilot & Edge AI Excellence Centers in 50 State Technical Universities.'
        }
      ];
      for (const f of initialForecasts) {
        await db.execute({
          sql: 'INSERT INTO skill_shortage_forecasts (id, domain, current_demand_index, projected_deficit_pct, risk_level, timeline, key_skills, recommended_action) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          args: [f.id, f.domain, f.current_demand_index, f.projected_deficit_pct, f.risk_level, f.timeline, f.key_skills, f.recommended_action]
        });
      }
    }

    // Seed Regional Skilling Grants
    const grantCount = await db.execute({ sql: 'SELECT COUNT(*) as count FROM regional_skilling_grants', args: [] });
    if ((grantCount.rows[0] as any).count === 0) {
      const initialGrants = [
        { id: 'grt-1', state_name: 'Uttar Pradesh', tier3_colleges_count: 142, talent_deficit_pct: 72, recommended_grant_amount: '₹42.50 Cr', priority_focus: 'IoT Hardware Labs & AI Model Deployment Centers' },
        { id: 'grt-2', state_name: 'Madhya Pradesh', tier3_colleges_count: 88, talent_deficit_pct: 65, recommended_grant_amount: '₹26.00 Cr', priority_focus: 'Ayush Clinical Data Centers & Precision Agro-Tech Labs' },
        { id: 'grt-3', state_name: 'Bihar', tier3_colleges_count: 76, talent_deficit_pct: 78, recommended_grant_amount: '₹24.50 Cr', priority_focus: 'Cloud DevOps Computing Clusters & High-Speed Optical R&D' },
        { id: 'grt-4', state_name: 'Odisha', tier3_colleges_count: 64, talent_deficit_pct: 58, recommended_grant_amount: '₹19.00 Cr', priority_focus: 'Semiconductor VLSI Embedded Labs & Drone Fabrication Hubs' },
        { id: 'grt-5', state_name: 'Rajasthan', tier3_colleges_count: 92, talent_deficit_pct: 61, recommended_grant_amount: '₹28.00 Cr', priority_focus: 'Clean Energy Microgrid Labs & Electric Vehicle (EV) Telemetry' }
      ];
      for (const g of initialGrants) {
        await db.execute({
          sql: 'INSERT INTO regional_skilling_grants (id, state_name, tier3_colleges_count, talent_deficit_pct, recommended_grant_amount, priority_focus) VALUES (?, ?, ?, ?, ?, ?)',
          args: [g.id, g.state_name, g.tier3_colleges_count, g.talent_deficit_pct, g.recommended_grant_amount, g.priority_focus]
        });
      }
    }

  } catch (err) {
    console.error('Error seeding blueprint data:', err);
  }

  console.log('Database initialized successfully');
}
