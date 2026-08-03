import { CertificationPath, Submission, StudentProgress, IssuedCredential, AuditLog, SupervisorOfficeHour, UserAccount } from './types';

export const INITIAL_CERTIFICATION_PATHS: CertificationPath[] = [
  {
    id: 'path-beginner',
    title: 'Beginner Level (Foundations)',
    levelColor: 'Beginner',
    description: 'Master HTML5 semantic layout, responsive CSS grids, flexbox alignment, and interactive JavaScript basics. The absolute starting block for any engineering candidate.',
    requiredPoints: 100,
    passingScore: 80,
    modules: [
      'Semantic HTML & Document Object Model (DOM)',
      'Modern CSS: Grid, Flexbox, & Responsive Queries',
      'Tailwind CSS Utility-First Foundations',
      'Vanilla JavaScript Event-Driven Interfaces'
    ]
  },
  {
    id: 'path-intermediate',
    title: 'Intermediate Level (Application)',
    levelColor: 'Intermediate',
    description: 'Learn modern single-page applications with React. Study state management optimization, advanced custom hooks, side-effect controls, and component styling paradigms.',
    requiredPoints: 200,
    passingScore: 85,
    modules: [
      'React Hook Lifecycle & Rendering Internals',
      'Global State Orchestration (Zustand, Context)',
      'Async Data Fetching, Interceptors, & Local Caching',
      'Component Animation with Motion & Fluid UI Transitions'
    ]
  },
  {
    id: 'path-advanced',
    title: 'Advanced Level (Competence)',
    levelColor: 'Advanced',
    description: 'Develop custom backend servers using Express, integrate database queries (SQL & NoSQL), implement JWT auth, and handle session management and API rate-limiting.',
    requiredPoints: 350,
    passingScore: 85,
    modules: [
      'Node.js Event Loop, File I/O, & Buffer Streams',
      'RESTful API Contract Design & Middleware Pipelines',
      'Database Modeling, Migrations, & Connection Pooling',
      'Redis Caching & Horizontal API Scaling Strategies'
    ]
  },
  {
    id: 'path-expert',
    title: 'Expert Level (Capstone & Mastery)',
    levelColor: 'Expert',
    description: 'The pinnacle of our engineering tracks. Implement production deployment pipelines, containerization with Docker, multi-region database replication, security Audits, and zero-trust policies.',
    requiredPoints: 500,
    passingScore: 90,
    modules: [
      'Docker Containerization, Swarms, & Kubernetes Pods',
      'CI/CD Pipeline Automation (GitHub Actions, Tests)',
      'Zero-Trust Security, HTTPS, CORS, & JWT Encryption',
      'System Architecture, Load Balancing, & SRE Performance Metrics'
    ]
  }
];

export const INITIAL_STUDENT_PROGRESS: StudentProgress = {
  name: 'Alex Mercer',
  email: 'alex.mercer@dojo.edu',
  currentLevel: 'Intermediate',
  points: 180,
  totalRequiredPoints: 200,
  joinedAt: '2026-01-10T08:00:00Z'
};

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-101',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@dojo.edu',
    level: 'Beginner',
    title: 'Interactive Personal Dashboard',
    submissionText: 'I built an interactive dashboard using semantic HTML5 and customized tailwind colors. It tracks daily tasks and includes persistent dark mode using localStorage. Let me know if the layouts are okay!',
    githubUrl: 'https://github.com/alex-mercer/personal-dashboard',
    status: 'approved',
    score: 95,
    feedback: 'Splendid work, Alex! Your grid layout shows solid comprehension. The interactive features in vanilla JavaScript are flawless. Keep up the high standard.',
    submittedAt: '2026-05-15T14:30:00Z',
    evaluatedBy: 'Lead Instructor Kenji (Senior Supervisor)',
    evaluatedAt: '2026-05-16T10:15:00Z'
  },
  {
    id: 'sub-102',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@dojo.edu',
    level: 'Intermediate',
    title: 'Collaborative Multi-user Canvas Project',
    submissionText: 'Here is my capstone for the Intermediate level. Built using React, custom hooks for state management, and Framer Motion for responsive canvas animations. I also integrated canvas resize observers.',
    githubUrl: 'https://github.com/alex-mercer/react-canvas-hub',
    status: 'pending',
    submittedAt: '2026-06-24T18:45:00Z',
    links: [
      { url: 'https://github.com/alex-mercer/react-canvas-hub', description: 'GitHub Repository' },
      { url: 'https://react-canvas-hub-demo.vercel.app', description: 'Live Staging Sandbox' }
    ],
    files: [
      { name: 'canvas-performance-audit.pdf', size: '2.4 MB', type: 'document' },
      { name: 'canvas-gesture-reels.mp4', size: '14.8 MB', type: 'video' }
    ]
  },
  {
    id: 'sub-201',
    studentName: 'Sophia Lin',
    studentEmail: 'sophia.lin@dojo.edu',
    level: 'Advanced',
    title: 'Distributed Chat API with Redis backing',
    submissionText: 'Finished Advanced backend. It implements Express with SSE, Redis cluster for pub/sub session state, and a PostgreSQL database with drizzle ORM schemas.',
    githubUrl: 'https://github.com/sophia-lin/express-redis-chat',
    status: 'pending',
    submittedAt: '2026-06-24T22:15:00Z',
    links: [
      { url: 'https://github.com/sophia-lin/express-redis-chat', description: 'GitHub Codebase' },
      { url: 'https://api.dojo-chat-staging.net/health', description: 'Production API Health Endpoint' }
    ],
    files: [
      { name: 'redis-cluster-topology.png', size: '1.1 MB', type: 'document' },
      { name: 'sse-load-test-report.pdf', size: '840 KB', type: 'document' }
    ]
  },
  {
    id: 'sub-301',
    studentName: 'Devon Carter',
    studentEmail: 'devon.carter@dojo.edu',
    level: 'Expert',
    title: 'Secure Enterprise Identity Proxy',
    submissionText: 'This is my Expert level capstone submission. Implemented zero-trust authentication proxies, multi-region distributed failovers, and Dockerized orchestration scripts.',
    githubUrl: 'https://github.com/devon-carter/zero-trust-proxy',
    status: 'approved',
    score: 98,
    feedback: 'Absolutely brilliant. The threat-model assessment and CI/CD coverage are outstanding. Truly earned the Expert credentials.',
    submittedAt: '2026-06-20T09:00:00Z',
    evaluatedBy: 'Director Tanaka',
    evaluatedAt: '2026-06-22T16:40:00Z'
  }
];

export const INITIAL_CREDENTIALS: IssuedCredential[] = [
  {
    id: 'CRED-BEG-88401',
    studentName: 'Alex Mercer',
    studentEmail: 'alex.mercer@dojo.edu',
    level: 'Beginner',
    issuedAt: '2026-05-16T10:15:00Z',
    hash: '0x8f2a1b92c4d5e6f3a7c8b9d0e1f2a3b4c5d6e7f8',
    status: 'active',
    signatures: {
      evaluator: 'Lead Instructor Kenji',
      admin: 'Platform Admin Sarah'
    }
  },
  {
    id: 'CRED-EXP-99120',
    studentName: 'Devon Carter',
    studentEmail: 'devon.carter@dojo.edu',
    level: 'Expert',
    issuedAt: '2026-06-22T16:40:00Z',
    hash: '0x3a7c8b9d0e1f2a3b4c5d6e7f80x8f2a1b92c4d5e6',
    status: 'active',
    signatures: {
      evaluator: 'Director Tanaka',
      admin: 'Platform Admin Sarah'
    }
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-06-25T05:30:00Z',
    actor: 'Alex Mercer',
    role: 'student',
    action: 'Submitted Intermediate level project "Collaborative Multi-user Canvas Project"',
    type: 'info'
  },
  {
    id: 'log-2',
    timestamp: '2026-06-25T04:15:00Z',
    actor: 'Sarah Admin',
    role: 'admin',
    action: 'Updated modules in Certification Path: Advanced Level',
    type: 'success'
  },
  {
    id: 'log-3',
    timestamp: '2026-06-24T22:15:00Z',
    actor: 'Sophia Lin',
    role: 'student',
    action: 'Submitted Advanced level project "Distributed Chat API with Redis backing"',
    type: 'info'
  },
  {
    id: 'log-4',
    timestamp: '2026-06-22T16:40:00Z',
    actor: 'Director Tanaka',
    role: 'evaluator',
    action: 'Approved Devon Carter for Expert Level Certification',
    type: 'success'
  }
];

export const INITIAL_SUPERVISOR_OFFICE_HOURS: SupervisorOfficeHour[] = [
  {
    id: 'slot-1',
    supervisorName: 'Lead Instructor Kenji',
    topic: 'Flexbox vs CSS Grid & Tailwind Responsive Systems',
    timeSlot: 'Thursdays 15:00 - 16:30 PST',
    capacity: 15,
    enrolled: 8
  },
  {
    id: 'slot-2',
    supervisorName: 'Director Tanaka',
    topic: 'Security Auditing & Kubernetes Deployment Strategies',
    timeSlot: 'Fridays 10:00 - 11:30 PST',
    capacity: 5,
    enrolled: 4
  },
  {
    id: 'slot-3',
    supervisorName: 'Mentor Amanda',
    topic: 'Mastering React State & Side Effect Lifecycle Hooks',
    timeSlot: 'Mondays 13:00 - 14:00 PST',
    capacity: 20,
    enrolled: 19
  }
];

export const INITIAL_USER_ACCOUNTS: UserAccount[] = [
  {
    id: 'user-1',
    name: 'Alex Mercer',
    email: 'alex.mercer@dojo.edu',
    role: 'student',
    status: 'active',
    levelColor: 'Intermediate',
    joinedAt: '2026-01-10T08:00:00Z'
  },
  {
    id: 'user-2',
    name: 'Sophia Lin',
    email: 'sophia.lin@dojo.edu',
    role: 'student',
    status: 'active',
    levelColor: 'Advanced',
    joinedAt: '2026-02-14T09:30:00Z'
  },
  {
    id: 'user-3',
    name: 'Devon Carter',
    email: 'devon.carter@dojo.edu',
    role: 'student',
    status: 'active',
    levelColor: 'Expert',
    joinedAt: '2025-11-02T11:00:00Z'
  },
  {
    id: 'user-4',
    name: 'Aria Sterling',
    email: 'aria.sterling@dojo.edu',
    role: 'student',
    status: 'active',
    levelColor: 'Beginner',
    joinedAt: '2026-05-20T14:15:00Z'
  },
  {
    id: 'user-5',
    name: 'Lead Instructor Kenji',
    email: 'kenji@dojo.edu',
    role: 'evaluator',
    status: 'active',
    joinedAt: '2025-01-01T09:00:00Z'
  },
  {
    id: 'user-6',
    name: 'Director Tanaka',
    email: 'tanaka@dojo.edu',
    role: 'evaluator',
    status: 'active',
    joinedAt: '2024-06-15T10:00:00Z'
  },
  {
    id: 'user-7',
    name: 'Mentor Amanda',
    email: 'amanda@dojo.edu',
    role: 'evaluator',
    status: 'active',
    joinedAt: '2025-03-10T11:30:00Z'
  }
];
