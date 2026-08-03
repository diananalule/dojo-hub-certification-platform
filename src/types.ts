export type UserRole = 'student' | 'admin' | 'evaluator';

export interface StudentProgress {
  name: string;
  email: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  points: number;
  totalRequiredPoints: number;
  joinedAt: string;
}

export interface SubmissionLink {
  url: string;
  description: string;
}

export interface SubmissionFile {
  name: string;
  size: string;
  type: 'document' | 'video';
}

export interface Submission {
  id: string;
  studentName: string;
  studentEmail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  title: string;
  submissionText: string;
  githubUrl?: string;
  localhostDetails?: string;
  videoDemoUrl?: string;
  submissionType?: 'capstone' | 'competence' | 'topic';
  trackId?: string;
  moduleId?: string;
  topicId?: string;
  status: 'pending' | 'approved' | 'rejected';
  score?: number;
  feedback?: string;
  submittedAt: string;
  evaluatedBy?: string;
  evaluatedAt?: string;
  links?: SubmissionLink[];
  files?: SubmissionFile[];
}

export interface CertificationPath {
  id: string;
  title: string;
  levelColor: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  description: string;
  requiredPoints: number;
  passingScore: number;
  modules: string[];
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: UserRole | 'guest';
  action: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface IssuedCredential {
  id: string;
  studentName: string;
  studentEmail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  issuedAt: string;
  hash: string;
  status: 'active' | 'revoked';
  signatures: {
    evaluator?: string;
    verifier?: string;
    admin?: string;
  };
}

export interface SupervisorOfficeHour {
  id: string;
  supervisorName: string;
  topic: string;
  timeSlot: string;
  capacity: number;
  enrolled: number;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'evaluator' | 'admin';
  status: 'active' | 'suspended';
  levelColor?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  joinedAt: string;
}

