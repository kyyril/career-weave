export interface WorkExperience {
  id?: string;
  job_title: string;
  company_name: string;
  start_date: string;
  end_date?: string;
  description?: string;
}

export interface Project {
  id?: string;
  project_title: string;
  description: string;
  project_url?: string;
}

export interface Skill {
  id?: string;
  skill_name: string;
}

export interface Profile {
  id?: string;
  full_name?: string;
  email?: string;
}

export interface Weave {
  id: string;
  job_url: string;
  job_title?: string;
  company_name?: string;
  generated_resume?: string;
  generated_cover_letter?: string;
  generated_interview_strategy?: any;
  created_at: string;
}

export interface InterviewSession {
  id: string;
  weave_id: string;
  question: string;
  user_answer?: string;
  ai_feedback?: string;
  question_number: number;
  created_at: string;
}