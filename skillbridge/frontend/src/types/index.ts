export type Role = 'STUDENT' | 'ACADEMICIAN' | 'RECRUITER' | 'ADMIN';
export type Proficiency = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type OpportunityType = 'INTERNSHIP' | 'JOB' | 'TRAINING';
export type ApplicationStatus = 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'REJECTED' | 'SELECTED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  profileImage?: string;
  phone?: string;
  bio?: string;
  is_onboarded?: boolean;
  created_at?: string;
}

export interface StudentProfile {
  id: string;
  user_id: string;
  education?: string;
  branch?: string;
  institution?: string;
  graduation_year?: number;
  cgpa?: number;
  interests?: string; // JSON
  career_preferences?: string; // JSON
  resume_url?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  profile_completion: number;
  projects?: Project[];
  certifications?: Certification[];
}

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name?: string;
  company_size?: string;
  industry?: string;
  website?: string;
  location?: string;
  description?: string;
  verified: boolean;
}

export interface AcademicianProfile {
  id: string;
  user_id: string;
  institution?: string;
  department?: string;
  designation?: string;
  specialization?: string;
  research_areas?: string; // JSON
  experience?: number;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  skill_name: string;
  category: string;
  proficiency: Proficiency;
  assessment_score?: number;
  verified: boolean;
}

export interface Assessment {
  id: string;
  title: string;
  description?: string;
  category: string;
  difficulty: Proficiency;
  duration?: number;
  question_count?: number;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  difficulty: string;
  points: number;
}

export interface AssessmentResult {
  id: string;
  score: number;
  totalPoints: number;
  percentage: number;
  proficiency: Proficiency;
  completedAt?: string;
  title?: string;
  category?: string;
}

export interface Opportunity {
  id: string;
  recruiter_id: string;
  title: string;
  description: string;
  type: OpportunityType;
  location?: string;
  location_type?: string;
  duration?: string;
  stipend?: string;
  salary_range?: string;
  deadline?: string;
  eligibility?: string;
  requirements?: string;
  responsibilities?: string;
  benefits?: string;
  is_active: boolean;
  created_at: string;
  recruiter_name?: string;
  company_name?: string;
  industry?: string;
  skills?: OpportunitySkill[];
  application_count?: number;
  matchScore?: number;
  matchingSkills?: OpportunitySkill[];
  missingSkills?: OpportunitySkill[];
}

export interface OpportunitySkill {
  skill_id: string;
  skill_name: string;
  category?: string;
  importance: 'REQUIRED' | 'PREFERRED';
}

export interface Application {
  id: string;
  student_id: string;
  opportunity_id: string;
  match_score?: number;
  status: ApplicationStatus;
  cover_letter?: string;
  applied_at: string;
  updated_at: string;
  // Joined fields
  title?: string;
  type?: string;
  location?: string;
  duration?: string;
  stipend?: string;
  salary_range?: string;
  company_name?: string;
  recruiter_name?: string;
  student_name?: string;
  student_email?: string;
  institution?: string;
  branch?: string;
  education?: string;
  cgpa?: number;
  skills?: UserSkill[];
}

export interface TrainingProgram {
  id: string;
  created_by_id: string;
  title: string;
  description: string;
  level: Proficiency;
  duration?: string;
  provider?: string;
  external_url?: string;
  category: string;
  is_active: boolean;
  created_by_name?: string;
  skills?: Skill[];
  skill_names?: string;
  enrollment_count?: number;
}

export interface Enrollment {
  id: string;
  student_id: string;
  training_program_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  enrolled_at: string;
  title?: string;
  category?: string;
  level?: string;
  duration?: string;
  provider?: string;
  skill_names?: string;
}

export interface MentorshipRequest {
  id: string;
  student_id: string;
  mentor_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  message?: string;
  topic?: string;
  created_at: string;
  mentor_name?: string;
  mentor_email?: string;
  mentor_designation?: string;
  mentor_organization?: string;
  student_name?: string;
  student_email?: string;
  institution?: string;
  branch?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

export interface Collaboration {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  deadline?: string;
  created_at: string;
  creator_name?: string;
  organization?: string;
}

export interface Project {
  id: string;
  student_profile_id: string;
  title: string;
  description?: string;
  technologies?: string; // JSON
  live_url?: string;
  github_url?: string;
  start_date?: string;
  end_date?: string;
}

export interface Certification {
  id: string;
  student_profile_id: string;
  title: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  credential_url?: string;
  credential_id?: string;
}
