import { db, initializeDatabase } from './db';
import bcrypt from 'bcryptjs';
import { getSeedQuestions, getSeedCodingChallenges, getSeedBadges } from './seed_questions';

function cuid(): string {
  return 'c' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}
const id = cuid;

async function seed() {
  await initializeDatabase();
  console.log('Seeding database...');

  // Clear existing data in dependency order
  for (const tbl of [
    'mentorship_messages','notifications','collaborations','mentorship_requests',
    'enrollments','training_skills','training_programs',
    'applications','opportunity_skills','opportunities',
    'user_badges','coding_submissions','coding_sandboxes',
    'assessment_results','questions','assessments',
    'user_skills','skills','certifications','projects',
    'student_profiles','recruiter_profiles','academician_profiles','users',
  ]) {
    await db.execute({ sql: `DELETE FROM ${tbl}`, args: [] });
  }

  const password = await bcrypt.hash('Demo@1234', 10);

  // ── USERS ────────────────────────────────────────────────────────────────
  const adminId    = id();
  const acadId     = id();
  const rec1Id     = id();
  const rec2Id     = id();
  const rec3Id     = id();
  const sIds       = Array.from({ length: 15 }, () => id());

  const users = [
    { id: adminId, name: 'Admin User',        email: 'admin@example.com',      role: 'ADMIN'       },
    { id: acadId,  name: 'Dr. Priya Sharma',  email: 'academic@example.com',   role: 'ACADEMICIAN' },
    { id: rec1Id,  name: 'Rahul Verma',       email: 'recruiter@example.com',  role: 'RECRUITER'   },
    { id: rec2Id,  name: 'Sneha Kapoor',      email: 'recruiter2@example.com', role: 'RECRUITER'   },
    { id: rec3Id,  name: 'Amit Joshi',        email: 'recruiter3@example.com', role: 'RECRUITER'   },
    { id: sIds[0],  name: 'Arjun Mehta',   email: 'student@example.com',   role: 'STUDENT' },
    { id: sIds[1],  name: 'Anjali Singh',  email: 'anjali@example.com',    role: 'STUDENT' },
    { id: sIds[2],  name: 'Vikram Patel',  email: 'vikram@example.com',    role: 'STUDENT' },
    { id: sIds[3],  name: 'Pooja Reddy',   email: 'pooja@example.com',     role: 'STUDENT' },
    { id: sIds[4],  name: 'Karan Gupta',   email: 'karan@example.com',     role: 'STUDENT' },
    { id: sIds[5],  name: 'Divya Nair',    email: 'divya@example.com',     role: 'STUDENT' },
    { id: sIds[6],  name: 'Rohan Kumar',   email: 'rohan@example.com',     role: 'STUDENT' },
    { id: sIds[7],  name: 'Meera Iyer',    email: 'meera@example.com',     role: 'STUDENT' },
    { id: sIds[8],  name: 'Aditya Sharma', email: 'aditya@example.com',    role: 'STUDENT' },
    { id: sIds[9],  name: 'Neha Joshi',    email: 'neha@example.com',      role: 'STUDENT' },
    { id: sIds[10], name: 'Siddharth Rao', email: 'siddharth@example.com', role: 'STUDENT' },
    { id: sIds[11], name: 'Riya Bansal',   email: 'riya@example.com',      role: 'STUDENT' },
    { id: sIds[12], name: 'Manish Tiwari', email: 'manish@example.com',    role: 'STUDENT' },
    { id: sIds[13], name: 'Shruti Desai',  email: 'shruti@example.com',    role: 'STUDENT' },
    { id: sIds[14], name: 'Harish Pillai', email: 'harish@example.com',    role: 'STUDENT' },
  ];
  for (const u of users) {
    await db.execute({ sql: 'INSERT INTO users (id,name,email,password_hash,role) VALUES (?,?,?,?,?)', args: [u.id, u.name, u.email, password, u.role] });
  }

  // ── PROFILES ─────────────────────────────────────────────────────────────
  await db.execute({ sql: 'INSERT INTO recruiter_profiles (id,user_id,company_name,industry,location,company_size,website,description,verified) VALUES (?,?,?,?,?,?,?,?,1)', args: [id(),rec1Id,'TechSolutions Pvt Ltd','Information Technology','Bangalore','501-2000','https://techsolutions.example.com','Leading software development and IT services company'] });
  await db.execute({ sql: 'INSERT INTO recruiter_profiles (id,user_id,company_name,industry,location,company_size,website,description,verified) VALUES (?,?,?,?,?,?,?,?,1)', args: [id(),rec2Id,'DataVision Analytics','Data Science & Analytics','Hyderabad','51-200','https://datavision.example.com','AI-powered data analytics and business intelligence firm'] });
  await db.execute({ sql: 'INSERT INTO recruiter_profiles (id,user_id,company_name,industry,location,company_size,website,description,verified) VALUES (?,?,?,?,?,?,?,?,1)', args: [id(),rec3Id,'CloudNova Systems','Cloud Computing','Pune','201-500','https://cloudnova.example.com','Cloud infrastructure and DevOps solutions provider'] });
  await db.execute({ sql: 'INSERT INTO academician_profiles (id,user_id,institution,department,designation,specialization,research_areas,experience) VALUES (?,?,?,?,?,?,?,?)', args: [id(),acadId,'IIT Bombay','Computer Science & Engineering','Associate Professor','Machine Learning & AI',JSON.stringify(['Machine Learning','Deep Learning','NLP','Computer Vision']),12] });

  const studentData = [
    { edu:'B.Tech',branch:'Computer Science',   inst:'IIT Delhi',           yr:2025,cgpa:8.7,i:['AI/ML','Web Dev'],         p:['Data Scientist','ML Engineer']          },
    { edu:'B.Tech',branch:'Information Tech',   inst:'NIT Trichy',          yr:2025,cgpa:8.2,i:['Full Stack','Cloud'],       p:['Backend Dev','Cloud Architect']         },
    { edu:'B.Tech',branch:'Electronics',        inst:'BITS Pilani',         yr:2026,cgpa:7.9,i:['IoT','Embedded'],           p:['IoT Engineer']                          },
    { edu:'MCA',   branch:'Computer Apps',      inst:'VIT Vellore',         yr:2025,cgpa:9.1,i:['Data Science','Analytics'], p:['Data Analyst','BI Developer']           },
    { edu:'B.Tech',branch:'Computer Science',   inst:'DTU Delhi',           yr:2026,cgpa:7.5,i:['Cybersecurity'],            p:['Security Engineer']                     },
    { edu:'B.Tech',branch:'Computer Science',   inst:'NITK Surathkal',      yr:2025,cgpa:8.8,i:['Mobile Dev'],               p:['Android Dev','Flutter Dev']             },
    { edu:'B.Tech',branch:'IT',                 inst:'Jadavpur University', yr:2026,cgpa:7.8,i:['DevOps','Cloud'],           p:['DevOps Engineer','SRE']                 },
    { edu:'M.Tech',branch:'Data Science',       inst:'IIT Madras',          yr:2025,cgpa:9.3,i:['NLP','AI Research'],        p:['Research Scientist','AI Engineer']      },
    { edu:'B.Tech',branch:'Computer Science',   inst:'Amity University',    yr:2026,cgpa:7.2,i:['Web Dev','UI/UX'],          p:['Frontend Dev','UI Designer']            },
    { edu:'B.Tech',branch:'Computer Science',   inst:'IIIT Hyderabad',      yr:2025,cgpa:8.5,i:['Blockchain'],               p:['Blockchain Dev']                        },
    { edu:'B.Tech',branch:'IT',                 inst:'Manipal University',  yr:2026,cgpa:8.0,i:['Cloud','Microservices'],    p:['Cloud Engineer']                        },
    { edu:'B.Sc CS',branch:'Computer Science',  inst:'Delhi University',    yr:2025,cgpa:8.4,i:['Data Analysis','Python'],   p:['Data Analyst']                          },
    { edu:'B.Tech',branch:'Computer Science',   inst:'Thapar University',   yr:2026,cgpa:7.6,i:['Game Dev','Unity'],         p:['Game Developer']                        },
    { edu:'MCA',   branch:'Computer Apps',      inst:'Symbiosis Institute', yr:2025,cgpa:8.9,i:['Testing','QA'],             p:['QA Engineer','Test Automation']         },
    { edu:'B.Tech',branch:'Computer Science',   inst:'CEG Chennai',         yr:2026,cgpa:8.1,i:['ML','Python'],              p:['ML Engineer','Data Scientist']          },
  ];
  for (let i=0;i<studentData.length;i++) {
    const sp = studentData[i];
    await db.execute({ sql:'INSERT INTO student_profiles (id,user_id,education,branch,institution,graduation_year,cgpa,interests,career_preferences,profile_completion) VALUES (?,?,?,?,?,?,?,?,?,?)', args:[id(),sIds[i],sp.edu,sp.branch,sp.inst,sp.yr,sp.cgpa,JSON.stringify(sp.i),JSON.stringify(sp.p),Math.floor(60+Math.random()*40)] });
  }

  // ── SKILLS ───────────────────────────────────────────────────────────────
  const skillsData = [
    {n:'Python',c:'Programming'},{n:'JavaScript',c:'Programming'},{n:'TypeScript',c:'Programming'},
    {n:'Java',c:'Programming'},{n:'C++',c:'Programming'},{n:'C',c:'Programming'},
    {n:'Go',c:'Programming'},{n:'Rust',c:'Programming'},
    {n:'React',c:'Web Development'},{n:'Node.js',c:'Web Development'},
    {n:'Express.js',c:'Web Development'},{n:'HTML/CSS',c:'Web Development'},
    {n:'Vue.js',c:'Web Development'},{n:'Angular',c:'Web Development'},
    {n:'Machine Learning',c:'Data Science'},{n:'Deep Learning',c:'Data Science'},
    {n:'TensorFlow',c:'Data Science'},{n:'PyTorch',c:'Data Science'},
    {n:'Data Analysis',c:'Data Science'},{n:'NLP',c:'Data Science'},
    {n:'SQL',c:'Database'},{n:'MongoDB',c:'Database'},{n:'PostgreSQL',c:'Database'},
    {n:'Docker',c:'DevOps'},{n:'Kubernetes',c:'DevOps'},{n:'CI/CD',c:'DevOps'},
    {n:'AWS',c:'Cloud'},{n:'Azure',c:'Cloud'},{n:'GCP',c:'Cloud'},
    {n:'Git',c:'Tools'},{n:'Linux',c:'Tools'},
    {n:'Flutter',c:'Mobile'},{n:'React Native',c:'Mobile'},
    {n:'Cybersecurity',c:'Security'},{n:'Networking',c:'Security'},
    {n:'Communication',c:'Soft Skills'},{n:'Problem Solving',c:'Soft Skills'},{n:'Team Leadership',c:'Soft Skills'},
  ];
  const skillIds: Record<string,string> = {};
  for (const s of skillsData) {
    const sid = id();
    skillIds[s.n] = sid;
    await db.execute({ sql:'INSERT OR IGNORE INTO skills (id,name,category) VALUES (?,?,?)', args:[sid,s.n,s.c] });
  }

  // User skills
  const studentSkillSets = [
    ['Python','Machine Learning','SQL','TensorFlow','Data Analysis','Git'],
    ['JavaScript','React','Node.js','HTML/CSS','SQL','Git'],
    ['C++','Python','Linux','Git','Communication'],
    ['Python','SQL','Data Analysis','Machine Learning','Communication','Problem Solving'],
    ['Cybersecurity','Linux','Python','Networking','Problem Solving'],
    ['Flutter','React Native','JavaScript','HTML/CSS','Git'],
    ['Docker','Kubernetes','AWS','Linux','Python','Git'],
    ['Python','NLP','Deep Learning','TensorFlow','Machine Learning'],
    ['React','HTML/CSS','JavaScript','TypeScript','Communication'],
    ['JavaScript','Node.js','Git','Problem Solving'],
    ['AWS','Docker','Node.js','Express.js','SQL','Git'],
    ['Python','Data Analysis','SQL','Communication'],
    ['C++','Python','Git','Problem Solving'],
    ['Python','SQL','Communication','Problem Solving'],
    ['Python','Machine Learning','SQL','TensorFlow','Data Analysis'],
  ];
  const profs = ['BEGINNER','INTERMEDIATE','ADVANCED'];
  for (let i=0;i<sIds.length;i++) {
    for (const sn of studentSkillSets[i]) {
      if (skillIds[sn]) {
        await db.execute({ sql:'INSERT OR IGNORE INTO user_skills (id,user_id,skill_id,proficiency,assessment_score,verified) VALUES (?,?,?,?,?,1)', args:[id(),sIds[i],skillIds[sn],profs[Math.floor(Math.random()*3)],Math.floor(50+Math.random()*50)] });
      }
    }
  }

  // ── ASSESSMENTS ──────────────────────────────────────────────────────────
  // IDs for 8 assessments
  const aIds = {
    python:          id(),
    webdev:          id(),
    datascience:     id(),
    ml:              id(),
    communication:   id(),
    problemsolving:  id(),
    coding_python:   id(),
    coding_multi:    id(),
  };

  const assessments = [
    { id:aIds.python,         title:'Python Programming',              desc:'Core Python concepts, OOP, and standard library',         cat:'Programming',      diff:'INTERMEDIATE', dur:30 },
    { id:aIds.webdev,         title:'Web Development Fundamentals',    desc:'HTML, CSS, JavaScript, DOM manipulation and APIs',        cat:'Web Development',  diff:'BEGINNER',     dur:25 },
    { id:aIds.datascience,    title:'Data Science Concepts',           desc:'Statistics, data wrangling, visualisation and EDA',       cat:'Data Science',     diff:'INTERMEDIATE', dur:35 },
    { id:aIds.ml,             title:'Machine Learning',                desc:'Algorithms, model evaluation, overfitting, pipelines',    cat:'Machine Learning', diff:'ADVANCED',     dur:40 },
    { id:aIds.communication,  title:'Communication & Soft Skills',     desc:'Professional communication, teamwork and leadership',     cat:'Soft Skills',      diff:'BEGINNER',     dur:20 },
    { id:aIds.problemsolving, title:'Problem Solving & Algorithms',    desc:'DSA, time/space complexity, sorting and searching',       cat:'Problem Solving',  diff:'INTERMEDIATE', dur:35 },
    { id:aIds.coding_python,  title:'Coding Challenge – Python',       desc:'Read code snippets, predict output, find bugs in Python', cat:'Programming',      diff:'INTERMEDIATE', dur:40 },
    { id:aIds.coding_multi,   title:'Coding Challenge – Multi-Language',desc:'JavaScript, Java, C++ and Go code reading questions',   cat:'Programming',      diff:'ADVANCED',     dur:45 },
  ];
  for (const a of assessments) {
    await db.execute({ sql:'INSERT INTO assessments (id,title,description,category,difficulty,duration) VALUES (?,?,?,?,?,?)', args:[a.id,a.title,a.desc,a.cat,a.diff,a.dur] });
  }

  // ── INDUSTRY-GRADE QUESTIONS (8 Categories, 96 High-Caliber Questions) ──
  const allQuestions = getSeedQuestions(aIds);
  for (const q of allQuestions) {
    await db.execute({
      sql: 'INSERT INTO questions (id,assessment_id,question,options,correct_answer,explanation,difficulty,points) VALUES (?,?,?,?,?,?,?,?)',
      args: [id(), q.aId, q.question, JSON.stringify(q.opts), q.correct, q.explanation, q.difficulty, q.points],
    });
  }

  // ── PRACTICAL CODING ARENA SANDBOXES (8 Comprehensive Coding Challenges) ──
  const sandboxes = getSeedCodingChallenges();
  for (const sb of sandboxes) {
    await db.execute({
      sql: 'INSERT INTO coding_sandboxes (id, title, language, difficulty, description, starter_code, test_cases) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [sb.id, sb.title, sb.language, sb.difficulty, sb.description, sb.starter_code, sb.test_cases],
    });
  }

  // ── ACCREDITED SKILL BADGES (Cryptographically Verifiable Ledger-Backed) ──
  const badges = getSeedBadges(sIds);
  for (const b of badges) {
    await db.execute({
      sql: 'INSERT INTO user_badges (id, user_id, badge_id, badge_name, badge_category, tier, score, assessment_title, verification_hash, ledger_block_id, issuer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [b.id, b.user_id, b.badge_id, b.badge_name, b.badge_category, b.tier, b.score, b.assessment_title, b.verification_hash, b.ledger_block_id, b.issuer],
    });
  }

  // ── OPPORTUNITIES ────────────────────────────────────────────────────────
  const oppIds = { ds_intern:id(), ml_intern:id(), fullstack_job:id(), devops_intern:id(), data_analyst:id(), frontend_intern:id(), backend_job:id(), cloud_intern:id() };
  const opps = [
    { id:oppIds.ds_intern,    rId:rec1Id, title:'Data Science Intern',         desc:'Build ML models for customer analytics and present insights to stakeholders.',                type:'INTERNSHIP', loc:'Bangalore', lt:'HYBRID', dur:'6 months', stip:'₹25,000/month', sl:'',          dl:'2026-10-15', elig:'Final year B.Tech/MCA, CGPA ≥ 7.0', reqs:'Python, Pandas, Scikit-learn, SQL',                          skills:[['Python','REQUIRED'],['Machine Learning','REQUIRED'],['SQL','REQUIRED'],['Data Analysis','REQUIRED'],['TensorFlow','PREFERRED']] },
    { id:oppIds.ml_intern,    rId:rec2Id, title:'ML Engineer Intern',           desc:'Work on deep learning projects for NLP and computer vision applications.',                   type:'INTERNSHIP', loc:'Hyderabad', lt:'ONSITE', dur:'4 months', stip:'₹30,000/month', sl:'',          dl:'2026-09-30', elig:'M.Tech or final year B.Tech in CS/IT with strong ML background', reqs:'Python, TensorFlow/PyTorch, NLP', skills:[['Python','REQUIRED'],['Machine Learning','REQUIRED'],['Deep Learning','REQUIRED'],['NLP','PREFERRED'],['TensorFlow','REQUIRED']] },
    { id:oppIds.fullstack_job,rId:rec1Id, title:'Full Stack Developer',         desc:'Build and maintain web apps using React and Node.js in an agile team.',                     type:'JOB',        loc:'Bangalore', lt:'HYBRID', dur:'Permanent', stip:'',              sl:'₹8-12 LPA', dl:'2026-11-01', elig:'B.Tech/MCA, 0-2 years exp.',                    reqs:'React, Node.js, SQL, REST APIs',                          skills:[['React','REQUIRED'],['Node.js','REQUIRED'],['JavaScript','REQUIRED'],['SQL','REQUIRED'],['TypeScript','PREFERRED'],['Docker','PREFERRED']] },
    { id:oppIds.devops_intern,rId:rec3Id, title:'DevOps Engineering Intern',    desc:'Build CI/CD pipelines and manage cloud infrastructure.',                                    type:'INTERNSHIP', loc:'Pune',      lt:'ONSITE', dur:'3 months', stip:'₹20,000/month', sl:'',          dl:'2026-09-15', elig:'B.Tech with Linux and cloud knowledge',         reqs:'Docker, Kubernetes (preferred), AWS, Linux CLI',         skills:[['Docker','REQUIRED'],['AWS','REQUIRED'],['Linux','REQUIRED'],['Kubernetes','PREFERRED'],['Git','REQUIRED']] },
    { id:oppIds.data_analyst, rId:rec2Id, title:'Data Analyst',                 desc:'Analyse large datasets and create dashboards for leadership decision-making.',              type:'JOB',        loc:'Hyderabad', lt:'REMOTE', dur:'Permanent', stip:'',              sl:'₹6-9 LPA',  dl:'2026-10-30', elig:'B.Tech/BCA/MCA with analytical skills',         reqs:'SQL, Python, Power BI or Tableau preferred',             skills:[['SQL','REQUIRED'],['Python','REQUIRED'],['Data Analysis','REQUIRED'],['Communication','REQUIRED'],['Machine Learning','PREFERRED']] },
    { id:oppIds.frontend_intern,rId:rec1Id,title:'Frontend Developer Intern',  desc:'Build responsive and accessible UIs with React and TypeScript.',                          type:'INTERNSHIP', loc:'Bangalore', lt:'HYBRID', dur:'6 months', stip:'₹18,000/month', sl:'',          dl:'2026-10-20', elig:'B.Tech/BCA passionate about UI/UX',             reqs:'HTML/CSS, JavaScript, React (preferred), Git',           skills:[['JavaScript','REQUIRED'],['HTML/CSS','REQUIRED'],['React','PREFERRED'],['TypeScript','PREFERRED'],['Git','REQUIRED']] },
    { id:oppIds.backend_job,  rId:rec3Id, title:'Backend Developer (Node.js)',  desc:'Design scalable APIs for a cloud platform serving millions of users.',                     type:'JOB',        loc:'Pune',      lt:'HYBRID', dur:'Permanent', stip:'',              sl:'₹10-16 LPA',dl:'2026-11-15', elig:'B.Tech, 1+ years exp. or strong portfolio',    reqs:'Node.js, Express.js, SQL/NoSQL, microservices',          skills:[['Node.js','REQUIRED'],['Express.js','REQUIRED'],['SQL','REQUIRED'],['Docker','PREFERRED'],['AWS','PREFERRED'],['Git','REQUIRED']] },
    { id:oppIds.cloud_intern, rId:rec3Id, title:'Cloud Solutions Intern',       desc:'Design and implement AWS-based solutions for enterprise clients.',                         type:'INTERNSHIP', loc:'Pune',      lt:'ONSITE', dur:'6 months', stip:'₹22,000/month', sl:'',          dl:'2026-10-01', elig:'B.Tech with cloud computing interest',           reqs:'AWS basics, Python scripting, Linux preferred',           skills:[['AWS','REQUIRED'],['Python','REQUIRED'],['Linux','PREFERRED'],['Docker','PREFERRED'],['Git','REQUIRED']] },
  ];
  for (const o of opps) {
    await db.execute({ sql:'INSERT INTO opportunities (id,recruiter_id,title,description,type,location,location_type,duration,stipend,salary_range,deadline,eligibility,requirements,is_active) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)', args:[o.id,o.rId,o.title,o.desc,o.type,o.loc,o.lt,o.dur,o.stip,o.sl,o.dl,o.elig,o.reqs] });
    for (const [sn,imp] of o.skills) {
      if (skillIds[sn]) await db.execute({ sql:'INSERT OR IGNORE INTO opportunity_skills (id,opportunity_id,skill_id,importance) VALUES (?,?,?,?)', args:[id(),o.id,skillIds[sn],imp] });
    }
  }

  // ── APPLICATIONS ─────────────────────────────────────────────────────────
  const appData = [
    {sid:sIds[0],oid:oppIds.ds_intern,   score:87,status:'SHORTLISTED'},
    {sid:sIds[0],oid:oppIds.ml_intern,   score:74,status:'UNDER_REVIEW'},
    {sid:sIds[3],oid:oppIds.data_analyst,score:91,status:'SELECTED'},
    {sid:sIds[1],oid:oppIds.fullstack_job,score:85,status:'APPLIED'},
    {sid:sIds[1],oid:oppIds.frontend_intern,score:88,status:'SHORTLISTED'},
    {sid:sIds[6],oid:oppIds.devops_intern,score:82,status:'APPLIED'},
    {sid:sIds[6],oid:oppIds.cloud_intern, score:78,status:'UNDER_REVIEW'},
    {sid:sIds[7],oid:oppIds.ml_intern,   score:93,status:'SHORTLISTED'},
    {sid:sIds[4],oid:oppIds.devops_intern,score:65,status:'REJECTED'},
    {sid:sIds[10],oid:oppIds.backend_job,score:79,status:'UNDER_REVIEW'},
    {sid:sIds[11],oid:oppIds.data_analyst,score:76,status:'APPLIED'},
    {sid:sIds[14],oid:oppIds.ds_intern,  score:83,status:'UNDER_REVIEW'},
  ];
  for (const a of appData) {
    await db.execute({ sql:'INSERT OR IGNORE INTO applications (id,student_id,opportunity_id,match_score,status) VALUES (?,?,?,?,?)', args:[id(),a.sid,a.oid,a.score,a.status] });
  }

  // ── TRAINING PROGRAMS (with REAL course URLs) ─────────────────────────────
  const tpIds = { py_ml:id(), fullstack:id(), aws:id(), docker:id(), data_analysis:id(), softskills:id(), java_prog:id(), dsa:id() };

  const trainingPrograms = [
    {
      id: tpIds.py_ml, cid: acadId,
      title: 'Python for Machine Learning',
      desc: 'Master Python for ML: NumPy, Pandas, Scikit-learn, TensorFlow. Covers EDA, feature engineering, model training and deployment.',
      level: 'INTERMEDIATE', dur: '12 weeks', provider: 'Coursera – Andrew Ng (DeepLearning.AI)',
      url: 'https://www.coursera.org/specializations/machine-learning-introduction',
      cat: 'Data Science',
      skills: ['Python','Machine Learning','Data Analysis','TensorFlow'],
    },
    {
      id: tpIds.fullstack, cid: acadId,
      title: 'Full Stack Web Development',
      desc: 'Complete roadmap from HTML/CSS/JS fundamentals to React, Node.js and databases. Build real-world projects.',
      level: 'BEGINNER', dur: '6 months', provider: 'The Odin Project (Free)',
      url: 'https://www.theodinproject.com/paths/full-stack-javascript',
      cat: 'Web Development',
      skills: ['HTML/CSS','JavaScript','React','Node.js','SQL'],
    },
    {
      id: tpIds.aws, cid: adminId,
      title: 'AWS Cloud Practitioner Essentials',
      desc: 'Foundational AWS training: core services, security, architecture, pricing. Preparation for AWS CCP certification.',
      level: 'BEGINNER', dur: '6 weeks', provider: 'AWS Skill Builder (Free)',
      url: 'https://explore.skillbuilder.aws/learn/course/134/aws-cloud-practitioner-essentials',
      cat: 'Cloud Computing',
      skills: ['AWS','Linux','Python'],
    },
    {
      id: tpIds.docker, cid: adminId,
      title: 'Docker & Kubernetes for Beginners',
      desc: 'Containerisation with Docker, orchestration with Kubernetes, and cloud-native development patterns.',
      level: 'INTERMEDIATE', dur: '8 weeks', provider: 'KodeKloud (Free tier)',
      url: 'https://kodekloud.com/courses/docker-for-the-absolute-beginner/',
      cat: 'DevOps',
      skills: ['Docker','Kubernetes','Linux','Git'],
    },
    {
      id: tpIds.data_analysis, cid: acadId,
      title: 'Data Analysis with Python',
      desc: 'Python data analysis using Pandas, NumPy, Matplotlib and Seaborn. SQL for data querying. Hands-on projects.',
      level: 'BEGINNER', dur: '10 weeks', provider: 'freeCodeCamp (Free)',
      url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/',
      cat: 'Data Science',
      skills: ['Python','SQL','Data Analysis'],
    },
    {
      id: tpIds.softskills, cid: acadId,
      title: 'Professional Communication & Soft Skills',
      desc: 'Business writing, interview preparation, presentation skills, and professional networking for the tech industry.',
      level: 'BEGINNER', dur: '4 weeks', provider: 'NPTEL – IIT Bombay (Free)',
      url: 'https://nptel.ac.in/courses/109101168',
      cat: 'Soft Skills',
      skills: ['Communication','Problem Solving','Team Leadership'],
    },
    {
      id: tpIds.java_prog, cid: acadId,
      title: 'Java Programming & Object-Oriented Design',
      desc: 'Core Java, OOP principles, Collections, Streams, Exception handling, and design patterns. NPTEL certified.',
      level: 'INTERMEDIATE', dur: '12 weeks', provider: 'NPTEL – IIT Kharagpur (Free)',
      url: 'https://nptel.ac.in/courses/106105191',
      cat: 'Programming',
      skills: ['Java','Problem Solving'],
    },
    {
      id: tpIds.dsa, cid: acadId,
      title: 'Data Structures & Algorithms',
      desc: 'Arrays, linked lists, trees, graphs, sorting, searching, dynamic programming and competitive programming techniques.',
      level: 'INTERMEDIATE', dur: '10 weeks', provider: 'MIT OpenCourseWare (Free)',
      url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
      cat: 'Problem Solving',
      skills: ['Problem Solving','C++','Python','Java'],
    },
  ];

  for (const tp of trainingPrograms) {
    await db.execute({ sql:'INSERT INTO training_programs (id,created_by_id,title,description,level,duration,provider,external_url,category) VALUES (?,?,?,?,?,?,?,?,?)', args:[tp.id,tp.cid,tp.title,tp.desc,tp.level,tp.dur,tp.provider,tp.url,tp.cat] });
    for (const sn of tp.skills) {
      if (skillIds[sn]) await db.execute({ sql:'INSERT OR IGNORE INTO training_skills (id,training_program_id,skill_id) VALUES (?,?,?)', args:[id(),tp.id,skillIds[sn]] });
    }
  }

  // ── ENROLLMENTS ───────────────────────────────────────────────────────────
  const enrollData = [
    {sid:sIds[0],  tpId:tpIds.py_ml,        prog:75, done:0},
    {sid:sIds[0],  tpId:tpIds.softskills,   prog:100,done:1},
    {sid:sIds[1],  tpId:tpIds.fullstack,    prog:50, done:0},
    {sid:sIds[3],  tpId:tpIds.data_analysis,prog:90, done:0},
    {sid:sIds[6],  tpId:tpIds.docker,       prog:60, done:0},
    {sid:sIds[7],  tpId:tpIds.py_ml,        prog:100,done:1},
    {sid:sIds[4],  tpId:tpIds.aws,          prog:30, done:0},
    {sid:sIds[14], tpId:tpIds.py_ml,        prog:45, done:0},
    {sid:sIds[11], tpId:tpIds.data_analysis,prog:100,done:1},
    {sid:sIds[8],  tpId:tpIds.fullstack,    prog:20, done:0},
    {sid:sIds[9],  tpId:tpIds.dsa,          prog:65, done:0},
    {sid:sIds[2],  tpId:tpIds.aws,          prog:15, done:0},
  ];
  for (const e of enrollData) {
    await db.execute({ sql:'INSERT OR IGNORE INTO enrollments (id,student_id,training_program_id,progress,completed,completed_at) VALUES (?,?,?,?,?,?)', args:[id(),e.sid,e.tpId,e.prog,e.done,e.done?new Date().toISOString():null] });
  }

  // ── MENTORSHIP REQUESTS ───────────────────────────────────────────────────
  const mentorData = [
    {sid:sIds[0], mid:acadId,  status:'ACCEPTED', msg:'I would like guidance on ML career paths and research opportunities.',          topic:'Machine Learning Career'},
    {sid:sIds[7], mid:acadId,  status:'ACCEPTED', msg:'Need help with NLP research paper writing and project structure.',              topic:'NLP Research Guidance'},
    {sid:sIds[3], mid:acadId,  status:'PENDING',  msg:'Looking for guidance on data science certifications and career planning.',      topic:'Data Science Certification'},
    {sid:sIds[1], mid:rec1Id,  status:'ACCEPTED', msg:'Would love career guidance for full-stack development roles.',                  topic:'Full Stack Career Path'},
    {sid:sIds[6], mid:rec3Id,  status:'PENDING',  msg:'Seeking advice on DevOps career transition and cloud certifications.',         topic:'DevOps Career Transition'},
  ];
  for (const m of mentorData) {
    await db.execute({ sql:'INSERT INTO mentorship_requests (id,student_id,mentor_id,status,message,topic) VALUES (?,?,?,?,?,?)', args:[id(),m.sid,m.mid,m.status,m.msg,m.topic] });
  }

  // ── SEED CHAT MESSAGES for accepted requests ──────────────────────────────
  // Get the accepted request IDs
  const acReqs = await db.execute({ sql:"SELECT id,student_id,mentor_id FROM mentorship_requests WHERE status='ACCEPTED'", args:[] });
  for (const mr of acReqs.rows as any[]) {
    // Mentor sends first message
    await db.execute({ sql:'INSERT INTO mentorship_messages (id,mentorship_request_id,sender_id,message) VALUES (?,?,?,?)', args:[id(),mr.id,mr.mentor_id,"Hello! I've accepted your mentorship request. What specific areas would you like to focus on first?"] });
    await db.execute({ sql:'INSERT INTO mentorship_messages (id,mentorship_request_id,sender_id,message) VALUES (?,?,?,?)', args:[id(),mr.id,mr.student_id,"Thank you so much for accepting! I'd love to start with understanding what skills are most important and how to build practical projects."] });
    await db.execute({ sql:'INSERT INTO mentorship_messages (id,mentorship_request_id,sender_id,message) VALUES (?,?,?,?)', args:[id(),mr.id,mr.mentor_id,"Great question. Focus on building end-to-end projects — employers value practical experience over theory alone. Start small, ship something, then iterate."] });
  }

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────
  const notifs = [
    {uid:sIds[0], msg:'Your application for "Data Science Intern" has been shortlisted!',               type:'APPLICATION'},
    {uid:sIds[0], msg:'New training program available: Python for Machine Learning',                     type:'TRAINING'},
    {uid:sIds[0], msg:'Your mentorship request with Dr. Priya Sharma has been accepted',                 type:'MENTORSHIP'},
    {uid:sIds[0], msg:'New opportunity matched: ML Engineer Intern (74% match)',                         type:'INFO'},
    {uid:sIds[3], msg:'Congratulations! You have been selected for "Data Analyst" position',             type:'APPLICATION'},
    {uid:sIds[1], msg:'Your application for "Frontend Developer Intern" has been shortlisted!',          type:'APPLICATION'},
    {uid:sIds[7], msg:'Your mentorship request with Dr. Priya Sharma has been accepted',                 type:'MENTORSHIP'},
    {uid:rec1Id,  msg:'New application received for "Data Science Intern" — Arjun Mehta (87% match)',    type:'INFO'},
    {uid:rec1Id,  msg:'New application received for "Full Stack Developer" — Anjali Singh (85% match)',  type:'INFO'},
    {uid:acadId,  msg:'New mentorship request from Pooja Reddy — Data Science Certification',            type:'MENTORSHIP'},
  ];
  for (const n of notifs) {
    await db.execute({ sql:'INSERT INTO notifications (id,user_id,message,type) VALUES (?,?,?,?)', args:[id(),n.uid,n.msg,n.type] });
  }

  // ── COLLABORATIONS ────────────────────────────────────────────────────────
  await db.execute({ sql:'INSERT INTO collaborations (id,user_id,title,description,type,status) VALUES (?,?,?,?,?,?)', args:[id(),acadId,'Industry-Academia ML Research','Research collaboration on ML for supply chain optimisation problems.','RESEARCH','OPEN'] });
  await db.execute({ sql:'INSERT INTO collaborations (id,user_id,title,description,type,status) VALUES (?,?,?,?,?,?)', args:[id(),acadId,'FDP: Cloud Computing (AWS)','3-day Faculty Development Programme covering AWS architecture and hands-on labs.','FDP','OPEN'] });

  console.log('\n✅ Seed complete!');
  console.log('   8 assessments | ' + allQuestions.length + ' questions (incl. coding challenges)');
  console.log('   8 training programs with real course URLs');
  console.log('   Mentorship chat messages seeded for accepted requests');
  console.log('\nDemo accounts (password: Demo@1234)');
  console.log('  student@example.com  |  academic@example.com  |  recruiter@example.com  |  admin@example.com');
}

seed().catch(console.error).finally(() => process.exit(0));
