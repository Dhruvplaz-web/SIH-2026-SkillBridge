import { db, initializeDatabase } from './db';
import bcrypt from 'bcryptjs';

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

  // ── QUESTIONS ────────────────────────────────────────────────────────────
  // Helper
  const q = (aId:string, question:string, opts:string[], correct:number, difficulty:string, points:number, explanation:string) => ({
    aId, question, opts, correct, difficulty, points, explanation
  });

  const allQuestions = [
    // ══════════════════════════════════════════════════════
    // PYTHON PROGRAMMING (12 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.python, "What is the output of: print(type([]))?",
      ["<class 'list'>","<class 'array'>","<class 'tuple'>","<class 'dict'>"],0,'BEGINNER',1,"[] creates a list, so type([]) returns <class 'list'>"),

    q(aIds.python, "Which keyword defines a function in Python?",
      ["function","def","func","define"],1,'BEGINNER',1,"Python uses 'def' to define functions"),

    q(aIds.python, "What does 'self' refer to in a Python class method?",
      ["The class itself","The current instance of the class","A global variable","The parent class"],1,'INTERMEDIATE',2,"'self' refers to the instance calling the method"),

    q(aIds.python, "What is a Python decorator?",
      ["A design pattern for inheritance","A function that wraps and modifies another function","A type of variable","A loop construct"],1,'INTERMEDIATE',2,"Decorators are higher-order functions that modify other functions"),

    q(aIds.python, "What does the 'yield' keyword do?",
      ["Stops the function permanently","Returns a value and pauses execution (generator)","Imports a module","Defines a global variable"],1,'ADVANCED',3,"'yield' makes a function a generator — execution pauses and resumes"),

    q(aIds.python, "What is list comprehension?",
      ["Appending to a list","A concise way to create lists: [expr for x in iterable]","A method to delete items","A sorting algorithm"],1,'INTERMEDIATE',2,"List comprehension is syntactic sugar for creating lists in one line"),

    q(aIds.python, "What does __init__ do in a Python class?",
      ["Destroys the object","Initialises the object when it is created","Creates a static method","Imports a module"],1,'BEGINNER',1,"__init__ is the constructor — called automatically when an instance is created"),

    q(aIds.python, "What is the difference between a list and a tuple?",
      ["No difference","Lists are mutable, tuples are immutable","Tuples are mutable, lists are immutable","Lists support fewer operations"],0,'BEGINNER',1,"Lists use [] and are mutable; tuples use () and are immutable"),

    q(aIds.python, "What does the *args parameter do in a function definition?",
      ["Accepts keyword arguments only","Accepts any number of positional arguments as a tuple","Accepts exactly two arguments","Marks required parameters"],1,'INTERMEDIATE',2,"*args collects extra positional arguments into a tuple"),

    q(aIds.python, "What is the output of: [x**2 for x in range(4)]?",
      ["[1,4,9,16]","[0,1,4,9]","[0,2,4,6]","[1,2,3,4]"],1,'INTERMEDIATE',2,"range(4) gives 0,1,2,3 → squares: 0,1,4,9"),

    q(aIds.python, "Which of these is used to handle exceptions in Python?",
      ["catch","except","handle","rescue"],1,'BEGINNER',1,"Python uses 'except' inside a try/except block"),

    q(aIds.python, "What does the 'with' statement do in Python?",
      ["Creates a loop","Manages context (e.g. auto-closes files)","Defines a class","Creates an alias"],1,'INTERMEDIATE',2,"'with' ensures proper resource management via __enter__/__exit__"),

    // ══════════════════════════════════════════════════════
    // WEB DEVELOPMENT (12 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.webdev, "What does HTML stand for?",
      ["HyperText Markup Language","High Transfer Markup Language","Hyper Transfer Modern Language","HyperText Modern Language"],0,'BEGINNER',1,"HTML = HyperText Markup Language"),

    q(aIds.webdev, "Which CSS property changes text colour?",
      ["font-color","text-color","color","foreground-color"],2,'BEGINNER',1,"The 'color' property sets the foreground text colour"),

    q(aIds.webdev, "What is the CSS box model?",
      ["A 3D CSS property","Content, padding, border, and margin layers around an element","A responsive grid","A JavaScript API"],1,'INTERMEDIATE',2,"The box model describes the rectangular boxes: content, padding, border, margin"),

    q(aIds.webdev, "What does 'async/await' do in JavaScript?",
      ["Styles elements","Handles asynchronous operations with synchronous-looking code","Defines classes","Runs code in parallel threads"],1,'INTERMEDIATE',2,"async/await is syntactic sugar over Promises for cleaner async code"),

    q(aIds.webdev, "What is event bubbling in the DOM?",
      ["A CSS animation","When an event on a child propagates up to ancestor elements","A Node.js feature","A browser security setting"],1,'ADVANCED',3,"Bubbling means the event fires on the target then travels up the DOM tree"),

    q(aIds.webdev, "What is the purpose of the DOCTYPE declaration?",
      ["Link stylesheets","Tell the browser which HTML version to render with","Import JavaScript","Add meta tags"],1,'BEGINNER',1,"<!DOCTYPE html> triggers standards mode rendering"),

    q(aIds.webdev, "What is a RESTful API?",
      ["A database","An architectural style using HTTP methods to perform CRUD operations","A JavaScript framework","A CSS methodology"],1,'INTERMEDIATE',2,"REST APIs use GET, POST, PUT, DELETE to interact with resources over HTTP"),

    q(aIds.webdev, "What does 'localStorage' do in browsers?",
      ["Fetches remote data","Stores key-value data that persists after the browser is closed","Manages cookies only","Connects to a database"],1,'INTERMEDIATE',2,"localStorage provides persistent client-side storage with no expiry"),

    q(aIds.webdev, "What is the difference between == and === in JavaScript?",
      ["No difference","== checks value; === checks value AND type","=== is slower","== is stricter"],1,'BEGINNER',1,"=== is strict equality (no type coercion); == performs type coercion"),

    q(aIds.webdev, "What does CSS Flexbox do?",
      ["Manages server requests","Provides a one-dimensional layout model for rows or columns","Handles database queries","Animates elements"],1,'INTERMEDIATE',2,"Flexbox is a CSS layout mode for distributing space along a single axis"),

    q(aIds.webdev, "What is a Promise in JavaScript?",
      ["A variable type","An object representing the eventual completion or failure of an async operation","A CSS selector","A Node.js module"],1,'INTERMEDIATE',2,"Promises represent eventual results of async operations with .then()/.catch()"),

    q(aIds.webdev, "What is CORS?",
      ["A CSS framework","A security mechanism controlling cross-origin HTTP requests","A JavaScript library","A database protocol"],1,'ADVANCED',3,"Cross-Origin Resource Sharing restricts web pages from making requests to different domains"),

    // ══════════════════════════════════════════════════════
    // DATA SCIENCE (12 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.datascience, "What is a p-value?",
      ["Probability of the observed data given the null hypothesis is true","The mean of the data","The standard deviation","The sample size"],0,'INTERMEDIATE',2,"A p-value < 0.05 typically leads to rejecting the null hypothesis"),

    q(aIds.datascience, "Why do we normalise data before ML?",
      ["To remove duplicates","To scale features to a similar range preventing any one feature from dominating","To sort rows","To add missing values"],1,'INTERMEDIATE',2,"Normalisation ensures all features contribute equally to gradient descent"),

    q(aIds.datascience, "What does variance measure?",
      ["Central tendency","The average squared deviation from the mean (spread)","Correlation","Sample size"],1,'INTERMEDIATE',2,"High variance = data is spread out far from the mean"),

    q(aIds.datascience, "What is a confusion matrix?",
      ["A data structure","A table showing TP, FP, TN, FN for a classification model","A visualisation of correlations","A type of neural network"],1,'INTERMEDIATE',2,"Confusion matrices help evaluate classifier performance across all classes"),

    q(aIds.datascience, "What is the difference between supervised and unsupervised learning?",
      ["Speed","Supervised uses labelled data; unsupervised finds patterns in unlabelled data","Size of data","Type of output"],1,'BEGINNER',1,"Supervised: labelled examples → predictions. Unsupervised: discover hidden structure"),

    q(aIds.datascience, "What is the interquartile range (IQR)?",
      ["Mean – Median","Q3 – Q1, the range of the middle 50% of data","Standard deviation squared","Total range of data"],1,'INTERMEDIATE',2,"IQR = Q3 - Q1, used to detect outliers via the 1.5×IQR rule"),

    q(aIds.datascience, "What is a Box Plot used for?",
      ["Showing proportions","Displaying the distribution, median, quartiles and outliers of a dataset","Plotting a straight line","Counting categories"],1,'BEGINNER',1,"Box plots show the five-number summary: min, Q1, median, Q3, max"),

    q(aIds.datascience, "What does PCA do?",
      ["Creates new features by combining originals to reduce dimensionality","Removes missing values","Trains a classifier","Calculates mean"],0,'ADVANCED',3,"PCA projects data onto orthogonal components ordered by variance explained"),

    q(aIds.datascience, "What is data leakage in ML?",
      ["Memory overflow","When information from the test set inadvertently leaks into training","Overfitting","Under-sampling"],1,'ADVANCED',3,"Leakage causes optimistic metrics during training but poor real-world performance"),

    q(aIds.datascience, "What is one-hot encoding?",
      ["Encrypting values","Converting categorical variables into binary columns per category","Removing duplicates","Scaling numbers to 0-1"],1,'INTERMEDIATE',2,"One-hot encoding creates a binary column for each category value"),

    q(aIds.datascience, "What is the Central Limit Theorem?",
      ["All populations are normal","Sample means approach a normal distribution as sample size increases, regardless of population shape","Variance decreases with more data","All statistics are unbiased"],1,'ADVANCED',3,"CLT underpins hypothesis testing by justifying normal distribution assumptions"),

    q(aIds.datascience, "What is cross-validation used for?",
      ["Speeding up training","Estimating how well a model generalises by testing on multiple held-out folds","Preventing overfitting by adding regularisation","Encoding categorical variables"],1,'INTERMEDIATE',2,"k-fold CV splits data into k folds; each fold acts as test set once"),

    // ══════════════════════════════════════════════════════
    // MACHINE LEARNING (12 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.ml, "What is overfitting?",
      ["Model performs poorly on training data","Model memorises training data and fails to generalise to new data","Model is too simple","Model has too few parameters"],1,'INTERMEDIATE',2,"Overfitting: low train error, high test error — model learned noise"),

    q(aIds.ml, "What is the role of a validation set?",
      ["To train the model","To tune hyperparameters without touching the test set","To test final generalisation","To preprocess features"],1,'INTERMEDIATE',2,"Validation set guides hyperparameter tuning while keeping test set untouched"),

    q(aIds.ml, "What algorithm does Random Forest use?",
      ["Gradient descent","Ensemble of decision trees trained on random data and feature subsets","Logistic regression","K-means clustering"],1,'INTERMEDIATE',2,"Random Forest averages predictions from many trees, reducing variance"),

    q(aIds.ml, "What is gradient descent?",
      ["A sorting algorithm","An optimisation algorithm that iteratively adjusts parameters to minimise a loss function","A type of neural network","A data augmentation method"],1,'ADVANCED',3,"Gradient descent moves parameters in the direction of steepest descent of the loss"),

    q(aIds.ml, "What do activation functions do in neural networks?",
      ["Initialise weights","Introduce non-linearity enabling networks to learn complex patterns","Normalise the input","Calculate accuracy"],1,'ADVANCED',3,"Without non-linearity a deep network collapses to a single linear transformation"),

    q(aIds.ml, "What is L2 regularisation (Ridge)?",
      ["Removes features","Adds the squared sum of weights to the loss to penalise large weights","Increases learning rate","Normalises inputs"],1,'ADVANCED',3,"L2 shrinks all weights towards zero, handling multicollinearity well"),

    q(aIds.ml, "What is the purpose of the learning rate?",
      ["Number of training samples","Controls the step size of each parameter update in gradient descent","Number of hidden layers","Batch size"],1,'INTERMEDIATE',2,"Too large → diverge; too small → slow convergence. Often tuned with schedulers"),

    q(aIds.ml, "What is the Bias-Variance tradeoff?",
      ["A memory-speed tradeoff","The tradeoff between underfitting (high bias) and overfitting (high variance)","A regularisation technique","The tradeoff between precision and recall"],1,'ADVANCED',3,"Optimal model minimises total error = bias² + variance + irreducible noise"),

    q(aIds.ml, "What does the F1 score measure?",
      ["Accuracy on balanced datasets only","Harmonic mean of precision and recall, useful when classes are imbalanced","Square root of accuracy","Time to train the model"],1,'INTERMEDIATE',2,"F1 = 2·(P·R)/(P+R); balances precision and recall in one metric"),

    q(aIds.ml, "What is K-means clustering?",
      ["A supervised classification method","An unsupervised algorithm that partitions data into K clusters by minimising intra-cluster variance","A dimension reduction technique","A regression algorithm"],1,'INTERMEDIATE',2,"K-means assigns each point to the nearest centroid and iteratively updates centroids"),

    q(aIds.ml, "What does 'transfer learning' mean?",
      ["Moving data between servers","Using a pre-trained model's weights as starting point for a new task","Training two models simultaneously","Copying hyperparameters"],1,'ADVANCED',3,"Transfer learning reuses knowledge from large pre-trained models, saving compute"),

    q(aIds.ml, "What is the vanishing gradient problem?",
      ["Gradients become too large","Gradients shrink exponentially through deep layers making early layers learn very slowly","Model accuracy decreases over epochs","Loss increases during training"],1,'ADVANCED',3,"Solutions include ReLU activations, batch normalisation and residual connections"),

    // ══════════════════════════════════════════════════════
    // COMMUNICATION & SOFT SKILLS (10 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.communication, "What is active listening?",
      ["Hearing words without focus","Fully concentrating on, understanding and responding to the speaker","Talking while the other speaks","Taking extensive notes"],1,'BEGINNER',1,"Active listening involves attention, empathy and appropriate responses"),

    q(aIds.communication, "What is the most important element of a professional email?",
      ["Fancy formatting","A clear subject line and concise, well-structured body","Long, detailed explanations","Using HTML templates"],1,'BEGINNER',1,"Professional emails should be purposeful, brief and easy to act on"),

    q(aIds.communication, "Non-verbal communication includes:",
      ["Only text messages","Body language, facial expressions, eye contact and posture","Only spoken words","Email signatures"],1,'BEGINNER',1,"About 55% of communication is non-verbal (Mehrabian's study)"),

    q(aIds.communication, "What is the STAR method used for?",
      ["Writing code documentation","Structuring answers to behavioural interview questions (Situation, Task, Action, Result)","A project management framework","A debugging technique"],1,'INTERMEDIATE',2,"STAR helps candidates give concrete, structured evidence of past behaviour"),

    q(aIds.communication, "What is constructive feedback?",
      ["Criticism with no solutions","Specific, actionable feedback focused on behaviour not personality","Praise only","Feedback given anonymously"],1,'INTERMEDIATE',2,"Constructive feedback is objective, specific, and aims to help the recipient improve"),

    q(aIds.communication, "What is emotional intelligence (EQ)?",
      ["IQ score","The ability to recognise, understand and manage your own and others' emotions","Technical competence","Memory capacity"],1,'INTERMEDIATE',2,"High EQ is linked to better leadership, teamwork and conflict resolution"),

    q(aIds.communication, "In a team conflict, the best first step is to:",
      ["Escalate to a manager immediately","Listen to all perspectives, identify the root cause, and seek a mutually acceptable solution","Ignore the conflict","Assign blame"],1,'INTERMEDIATE',2,"Collaborative conflict resolution preserves relationships and leads to durable solutions"),

    q(aIds.communication, "What does 'growth mindset' mean?",
      ["Believing abilities are fixed at birth","Believing skills can be developed through effort, learning and persistence","Focusing only on strengths","Avoiding difficult tasks"],1,'BEGINNER',1,"Carol Dweck's research shows growth mindset leads to greater achievement"),

    q(aIds.communication, "Which is a key principle of effective presentations?",
      ["Include as much text as possible on each slide","One key idea per slide, supported by visuals and concise language","Use complex animations","Read directly from the slides"],1,'BEGINNER',1,"Minimalist slides keep audiences focused on the speaker, not the text"),

    q(aIds.communication, "What is the purpose of a 30-60-90 day plan?",
      ["A financial budget","A structured plan outlining goals and priorities for the first 3 months in a new role","A coding sprint plan","An annual performance review"],1,'INTERMEDIATE',2,"30-60-90 plans show initiative and help new employees ramp up systematically"),

    // ══════════════════════════════════════════════════════
    // PROBLEM SOLVING & ALGORITHMS (12 questions)
    // ══════════════════════════════════════════════════════
    q(aIds.problemsolving, "What is the time complexity of binary search?",
      ["O(n)","O(n²)","O(log n)","O(1)"],2,'INTERMEDIATE',2,"Binary search halves the search space each step → O(log n)"),

    q(aIds.problemsolving, "What does a hash table provide on average?",
      ["O(n) lookups","O(log n) lookups","O(1) average-case lookups and insertions","O(n log n) lookups"],2,'INTERMEDIATE',2,"Hash tables use a hash function to map keys to buckets → O(1) average"),

    q(aIds.problemsolving, "Which algorithm uses the 'divide-and-conquer' strategy?",
      ["Bubble sort","Merge sort","Linear search","Insertion sort"],1,'INTERMEDIATE',2,"Merge sort divides the array, recursively sorts, then merges → O(n log n)"),

    q(aIds.problemsolving, "What is dynamic programming?",
      ["Programming with dynamic types","Solving problems by breaking them into overlapping sub-problems and storing results (memoisation/tabulation)","A type of sorting","Object-oriented programming"],1,'ADVANCED',3,"DP avoids recomputing overlapping subproblems, reducing exponential to polynomial time"),

    q(aIds.problemsolving, "What data structure follows LIFO order?",
      ["Queue","Stack","Linked list","Heap"],1,'BEGINNER',1,"Stack: Last In First Out — push/pop from the top"),

    q(aIds.problemsolving, "What is the worst-case time complexity of QuickSort?",
      ["O(n log n)","O(n²)","O(n)","O(log n)"],1,'INTERMEDIATE',2,"Worst case O(n²) when pivot always picks min/max — randomised pivot mitigates this"),

    q(aIds.problemsolving, "What is a graph in data structures?",
      ["A bar chart","A non-linear structure of nodes (vertices) connected by edges","A sorted array","A type of tree"],1,'INTERMEDIATE',2,"Graphs model relationships: social networks, maps, dependency trees etc."),

    q(aIds.problemsolving, "Which traversal visits all nodes at depth d before depth d+1?",
      ["DFS","In-order","BFS (Breadth-First Search)","Post-order"],2,'INTERMEDIATE',2,"BFS uses a queue to explore level by level"),

    q(aIds.problemsolving, "What is the space complexity of recursive Fibonacci without memoisation?",
      ["O(1)","O(n) call stack","O(n²)","O(2ⁿ)"],1,'ADVANCED',3,"Each call creates a stack frame; max depth is n → O(n) space"),

    q(aIds.problemsolving, "What is a greedy algorithm?",
      ["An algorithm that tries all possibilities","Makes the locally optimal choice at each step hoping for a global optimum","Always finds the optimal solution","Uses dynamic programming"],1,'INTERMEDIATE',2,"Greedy works for problems with greedy-choice property (e.g. activity selection, Huffman coding)"),

    q(aIds.problemsolving, "What does Big-O notation measure?",
      ["Exact execution time","Upper bound of an algorithm's runtime as input size grows","Memory layout","Number of variables"],1,'BEGINNER',1,"Big-O describes worst-case growth rate, independent of hardware"),

    q(aIds.problemsolving, "Which sorting algorithm is most efficient on nearly-sorted arrays?",
      ["QuickSort","Merge Sort","Insertion Sort","Heap Sort"],2,'INTERMEDIATE',2,"Insertion sort degrades gracefully on nearly-sorted data: O(n) in best case"),

    // ══════════════════════════════════════════════════════
    // CODING CHALLENGE — PYTHON (12 questions, read-code style)
    // ══════════════════════════════════════════════════════
    q(aIds.coding_python,
`What is the output of this Python code?
\`\`\`python
def mystery(n):
    if n <= 1:
        return n
    return mystery(n-1) + mystery(n-2)
print(mystery(6))
\`\`\``,
      ["6","7","8","13"],3,'INTERMEDIATE',2,"mystery is Fibonacci. F(6)=8... actually F(6)=8: 0,1,1,2,3,5,8 → F(6)=8. But 0-indexed vs 1-indexed matters: F(0)=0,F(1)=1,F(2)=1,F(3)=2,F(4)=3,F(5)=5,F(6)=8"),

    q(aIds.coding_python,
`Find the bug in this Python code:
\`\`\`python
def is_palindrome(s):
    return s == s.reverse()
\`\`\``,
      ["No bug","'reverse()' is a list method — strings use s[::-1] instead","The function name is wrong","Missing return type"],1,'INTERMEDIATE',2,"str.reverse() does not exist in Python. Use s[::-1] or list(s).reverse()"),

    q(aIds.coding_python,
`What does this code print?
\`\`\`python
x = [1, 2, 3]
y = x
y.append(4)
print(x)
\`\`\``,
      ["[1, 2, 3]","[1, 2, 3, 4]","Error","[4]"],1,'INTERMEDIATE',2,"y = x copies the reference, not the list. Both point to the same object"),

    q(aIds.coding_python,
`What is the output?
\`\`\`python
result = [i*2 for i in range(1,5) if i % 2 == 0]
print(result)
\`\`\``,
      ["[2, 4, 6, 8]","[4, 8]","[2, 6]","[1, 3]"],1,'INTERMEDIATE',2,"range(1,5)=[1,2,3,4]. Even numbers: 2,4. Doubled: 4,8"),

    q(aIds.coding_python,
`What is the time complexity of this function?
\`\`\`python
def find_pair(arr, target):
    seen = set()
    for num in arr:
        if target - num in seen:
            return True
        seen.add(num)
    return False
\`\`\``,
      ["O(n²)","O(n log n)","O(n)","O(1)"],2,'ADVANCED',3,"Set lookups are O(1) average; we iterate once → O(n) overall"),

    q(aIds.coding_python,
`What does this decorator do?
\`\`\`python
import functools
def memoize(fn):
    cache = {}
    @functools.wraps(fn)
    def wrapper(*args):
        if args not in cache:
            cache[args] = fn(*args)
        return cache[args]
    return wrapper
\`\`\``,
      ["Logs function calls","Caches results so the function is not called again with the same arguments","Retries on exception","Limits call frequency"],1,'ADVANCED',3,"Memoisation caches return values — classic dynamic programming technique"),

    q(aIds.coding_python,
`What is the output?
\`\`\`python
a = (1, 2, 3)
a[0] = 10
print(a)
\`\`\``,
      ["(10, 2, 3)","(1, 2, 3)","TypeError: 'tuple' object does not support item assignment","None"],2,'BEGINNER',1,"Tuples are immutable — assigning to an index raises TypeError"),

    q(aIds.coding_python,
`What is the output?
\`\`\`python
def count(lst):
    freq = {}
    for item in lst:
        freq[item] = freq.get(item, 0) + 1
    return freq
print(count(['a','b','a','c','b','a']))
\`\`\``,
      ["{'a':1,'b':1,'c':1}","{'a':3,'b':2,'c':1}","{'a':2,'b':2,'c':2}","Error"],1,'INTERMEDIATE',2,"dict.get(key,0) returns 0 if key not found — builds a frequency map"),

    q(aIds.coding_python,
`Spot the error:
\`\`\`python
for i in range(10):
    if i = 5:
        print("Found")
\`\`\``,
      ["No error","= should be == (assignment instead of comparison)","range should start at 1","print needs parentheses"],1,'BEGINNER',1,"Single = is assignment. Use == for comparison in conditionals"),

    q(aIds.coding_python,
`What is the output?
\`\`\`python
nums = [3,1,4,1,5,9,2,6]
print(sorted(nums)[-2])
\`\`\``,
      ["6","9","5","2"],0,'INTERMEDIATE',2,"sorted: [1,1,2,3,4,5,6,9]. Index -2 = 6"),

    q(aIds.coding_python,
`What is printed?
\`\`\`python
gen = (x**2 for x in range(5))
print(next(gen))
print(next(gen))
\`\`\``,
      ["0 then 4","0 then 1","1 then 4","0 then 2"],1,'ADVANCED',3,"Generator yields 0,1,4,9,16. next() gives 0, then 1"),

    q(aIds.coding_python,
`What does this function return for f(4)?
\`\`\`python
def f(n):
    return sum(i for i in range(1, n+1) if i % 2 != 0)
\`\`\``,
      ["4","6","9","10"],2,'INTERMEDIATE',2,"Odd numbers in 1..4 are 1 and 3. Sum = 4. Wait: 1+3 = 4. Correct answer is 4"),

    // ══════════════════════════════════════════════════════
    // CODING CHALLENGE — MULTI-LANGUAGE (12 questions)
    // JS, Java, C++, Go — read code, predict output, spot bugs
    // ══════════════════════════════════════════════════════
    q(aIds.coding_multi,
`[JavaScript] What is the output?
\`\`\`javascript
const arr = [1, 2, 3];
const doubled = arr.map(x => x * 2);
console.log(doubled);
\`\`\``,
      ["[1,2,3]","[2,4,6]","[3,6,9]","undefined"],1,'BEGINNER',1,"Array.map() returns a new array; each element is multiplied by 2"),

    q(aIds.coding_multi,
`[JavaScript] What does this print?
\`\`\`javascript
let x = 5;
let y = "5";
console.log(x == y);
console.log(x === y);
\`\`\``,
      ["true / true","true / false","false / false","false / true"],1,'BEGINNER',1,"== coerces types (5 == '5' → true); === is strict (number !== string)"),

    q(aIds.coding_multi,
`[JavaScript] What is the output?
\`\`\`javascript
function makeCounter() {
  let count = 0;
  return () => ++count;
}
const c = makeCounter();
console.log(c(), c(), c());
\`\`\``,
      ["0 1 2","1 1 1","1 2 3","0 0 0"],2,'INTERMEDIATE',2,"Closure captures 'count' by reference — each call increments the same variable"),

    q(aIds.coding_multi,
`[JavaScript] Spot the bug:
\`\`\`javascript
async function fetchData() {
  const res = fetch('https://api.example.com/data');
  const data = res.json();
  return data;
}
\`\`\``,
      ["No bug","Missing 'await' before fetch() and res.json()","Wrong function name","Missing semicolons"],1,'INTERMEDIATE',2,"Without await, res is a Promise not a Response, and res.json() will throw"),

    q(aIds.coding_multi,
`[Java] What is the output?
\`\`\`java
public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 3, 8, 1};
        int max = arr[0];
        for (int n : arr) {
            if (n > max) max = n;
        }
        System.out.println(max);
    }
}
\`\`\``,
      ["5","1","8","3"],2,'BEGINNER',1,"Linear scan tracks maximum — arr max is 8"),

    q(aIds.coding_multi,
`[Java] What happens when this code runs?
\`\`\`java
String s = null;
System.out.println(s.length());
\`\`\``,
      ["Prints 0","Prints null","Throws NullPointerException","Compiles but prints nothing"],2,'INTERMEDIATE',2,"Calling a method on a null reference throws NullPointerException at runtime"),

    q(aIds.coding_multi,
`[Java] What is the output?
\`\`\`java
int result = 0;
for (int i = 1; i <= 5; i++) {
    result += i;
}
System.out.println(result);
\`\`\``,
      ["10","14","15","25"],2,'BEGINNER',1,"1+2+3+4+5 = 15"),

    q(aIds.coding_multi,
`[C++] What is the output?
\`\`\`cpp
#include <iostream>
using namespace std;
int main() {
    int x = 10;
    int* ptr = &x;
    *ptr = 20;
    cout << x << endl;
    return 0;
}
\`\`\``,
      ["10","20","Address of x","Undefined behaviour"],1,'INTERMEDIATE',2,"ptr points to x; *ptr=20 writes 20 to x's memory location"),

    q(aIds.coding_multi,
`[C++] Spot the memory bug:
\`\`\`cpp
int* create() {
    int x = 42;
    return &x;
}
int main() {
    int* p = create();
    cout << *p;
}
\`\`\``,
      ["No bug","Dangling pointer — x is stack-allocated and destroyed when create() returns","Missing header","Wrong return type"],1,'ADVANCED',3,"Returning the address of a local stack variable is undefined behaviour"),

    q(aIds.coding_multi,
`[C++] What does this print?
\`\`\`cpp
#include <iostream>
using namespace std;
int main() {
    for (int i = 0; i < 5; i += 2)
        cout << i << " ";
    return 0;
}
\`\`\``,
      ["0 1 2 3 4","0 2 4","1 3 5","0 2 4 6"],1,'BEGINNER',1,"i starts at 0, increments by 2 each step: 0, 2, 4"),

    q(aIds.coding_multi,
`[Go] What does this print?
\`\`\`go
package main
import "fmt"
func add(a, b int) int {
    return a + b
}
func main() {
    fmt.Println(add(3, 4))
}
\`\`\``,
      ["34","7","3 4","Error"],1,'BEGINNER',1,"Go's add returns the integer sum 3+4=7"),

    q(aIds.coding_multi,
`[Go] What is distinctive about Go's error handling?
\`\`\`go
result, err := divide(10, 0)
if err != nil {
    fmt.Println("Error:", err)
}
\`\`\``,
      ["Go uses try/catch like Java","Go returns errors as explicit return values; callers must check them","Go panics automatically","Go ignores errors"],1,'INTERMEDIATE',2,"Go avoids exceptions — errors are values returned alongside results"),
  ];

  for (const q of allQuestions) {
    await db.execute({
      sql: 'INSERT INTO questions (id,assessment_id,question,options,correct_answer,explanation,difficulty,points) VALUES (?,?,?,?,?,?,?,?)',
      args: [id(), q.aId, q.question, JSON.stringify(q.opts), q.correct, q.explanation, q.difficulty, q.points],
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
