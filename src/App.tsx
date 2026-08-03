import React, { useState, useEffect } from 'react';
import { UserRole, StudentProgress, Submission, CertificationPath, IssuedCredential, AuditLog, SupervisorOfficeHour, UserAccount } from './types';
import { 
  INITIAL_STUDENT_PROGRESS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_CERTIFICATION_PATHS, 
  INITIAL_CREDENTIALS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SUPERVISOR_OFFICE_HOURS,
  INITIAL_USER_ACCOUNTS
} from './mockData';
import { Track, DOJO_TRACKS } from './tracksData';
import Sidebar from './components/Sidebar';
import TopNavbar from './components/TopNavbar';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import EvaluatorDashboard from './components/EvaluatorDashboard';
import AuthScreen from './components/AuthScreen';

// Automatically clear any outdated color-based localStorage states to prevent state mismatches
(() => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedPaths = window.localStorage.getItem('dojo_certification_paths');
    if (savedPaths && (savedPaths.includes('path-white') || savedPaths.includes('path-yellow'))) {
      window.localStorage.removeItem('dojo_student_progress');
      window.localStorage.removeItem('dojo_submissions');
      window.localStorage.removeItem('dojo_certification_paths');
      window.localStorage.removeItem('dojo_credentials');
      window.localStorage.removeItem('dojo_audit_logs');
      window.localStorage.removeItem('dojo_office_hours');
      window.localStorage.removeItem('dojo_user_accounts');
      window.localStorage.removeItem('dojo_completed_topics');
      window.localStorage.removeItem('dojo_submitted_topics');
    }
  }
})();

export default function App() {
  
  // 1. Roles & Active Tabs state
  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('dojo_active_role');
    return (saved as UserRole) || 'student';
  });
  const [activeTab, setActiveTab] = useState<string>(() => {
    const saved = localStorage.getItem('dojo_active_tab');
    return saved || 'student-overview';
  });

  // Current logged in user account session
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; role: UserRole } | null>(() => {
    const saved = localStorage.getItem('dojo_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Dynamic Course Categories
  const [categories, setCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('dojo_categories');
    return saved ? JSON.parse(saved) : ['Hardware', 'Software', 'Data Science'];
  });

  // 2. Platform Core states (Persisted in localStorage)
  const [studentProgress, setStudentProgress] = useState<StudentProgress>(() => {
    const savedUser = localStorage.getItem('dojo_current_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      if (parsedUser.role === 'student') {
        const emailKey = parsedUser.email.toLowerCase();
        const savedProgress = localStorage.getItem(`dojo_student_progress_${emailKey}`);
        if (savedProgress) return JSON.parse(savedProgress);
        
        if (emailKey === 'alex.mercer@dojo.edu') {
          return INITIAL_STUDENT_PROGRESS;
        } else {
          return {
            name: parsedUser.name,
            email: parsedUser.email,
            currentLevel: 'Beginner',
            points: 0,
            totalRequiredPoints: 100,
            joinedAt: new Date().toISOString()
          };
        }
      }
    }
    const saved = localStorage.getItem('dojo_student_progress');
    return saved ? JSON.parse(saved) : INITIAL_STUDENT_PROGRESS;
  });

  const [submissions, setSubmissions] = useState<Submission[]>(() => {
    const saved = localStorage.getItem('dojo_submissions');
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [certificationPaths, setCertificationPaths] = useState<CertificationPath[]>(() => {
    const saved = localStorage.getItem('dojo_certification_paths');
    return saved ? JSON.parse(saved) : INITIAL_CERTIFICATION_PATHS;
  });

  const [credentials, setCredentials] = useState<IssuedCredential[]>(() => {
    const saved = localStorage.getItem('dojo_credentials');
    return saved ? JSON.parse(saved) : INITIAL_CREDENTIALS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('dojo_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [officeHours, setOfficeHours] = useState<SupervisorOfficeHour[]>(() => {
    const saved = localStorage.getItem('dojo_office_hours');
    return saved ? JSON.parse(saved) : INITIAL_SUPERVISOR_OFFICE_HOURS;
  });

  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('dojo_user_accounts');
    return saved ? JSON.parse(saved) : INITIAL_USER_ACCOUNTS;
  });

  const [tracks, setTracks] = useState<Track[]>(() => {
    const saved = localStorage.getItem('dojo_tracks');
    return saved ? JSON.parse(saved) : DOJO_TRACKS;
  });

  // 3. Persist State in localStorage on changes
  useEffect(() => {
    if (studentProgress && studentProgress.email) {
      const emailKey = studentProgress.email.toLowerCase();
      localStorage.setItem(`dojo_student_progress_${emailKey}`, JSON.stringify(studentProgress));
    }
    localStorage.setItem('dojo_student_progress', JSON.stringify(studentProgress));
  }, [studentProgress]);

  useEffect(() => {
    localStorage.setItem('dojo_tracks', JSON.stringify(tracks));
  }, [tracks]);

  useEffect(() => {
    localStorage.setItem('dojo_submissions', JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    localStorage.setItem('dojo_certification_paths', JSON.stringify(certificationPaths));
  }, [certificationPaths]);

  useEffect(() => {
    localStorage.setItem('dojo_credentials', JSON.stringify(credentials));
  }, [credentials]);

  useEffect(() => {
    localStorage.setItem('dojo_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('dojo_office_hours', JSON.stringify(officeHours));
  }, [officeHours]);

  useEffect(() => {
    localStorage.setItem('dojo_user_accounts', JSON.stringify(userAccounts));
  }, [userAccounts]);

  useEffect(() => {
    localStorage.setItem('dojo_active_role', activeRole);
  }, [activeRole]);

  useEffect(() => {
    localStorage.setItem('dojo_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('dojo_current_user', JSON.stringify(currentUser));
      setActiveRole(currentUser.role);
    } else {
      localStorage.removeItem('dojo_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('dojo_categories', JSON.stringify(categories));
  }, [categories]);

  const handleAuthSuccess = (user: { name: string; email: string; role: UserRole }) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    
    if (user.role === 'student') {
      const emailKey = user.email.toLowerCase();
      const savedProgress = localStorage.getItem(`dojo_student_progress_${emailKey}`);
      if (savedProgress) {
        setStudentProgress(JSON.parse(savedProgress));
      } else {
        if (emailKey === 'alex.mercer@dojo.edu') {
          setStudentProgress(INITIAL_STUDENT_PROGRESS);
        } else {
          setStudentProgress({
            name: user.name,
            email: user.email,
            currentLevel: 'Beginner',
            points: 0,
            totalRequiredPoints: 100,
            joinedAt: new Date().toISOString()
          });
        }
      }
    }

    const exists = userAccounts.some(acc => acc.email.toLowerCase() === user.email.toLowerCase());
    if (!exists && user.role !== 'admin') {
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        name: user.name,
        email: user.email,
        role: user.role === 'evaluator' ? 'evaluator' : 'student',
        status: 'active',
        joinedAt: new Date().toISOString()
      };
      setUserAccounts(prev => [...prev, newAcc]);
    }
    
    const actorName = user.role === 'admin' ? 'Sarah Chen (Admin)' : user.role === 'evaluator' ? 'Lead Instructor Kenji (Supervisor)' : user.name;
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      role: user.role,
      action: `Logged into secure session with role: ${user.role}`,
      type: 'success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const handleRegisterUser = (user: { name: string; email: string; role: UserRole }) => {
    const exists = userAccounts.some(acc => acc.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      const newAcc: UserAccount = {
        id: `user-${Date.now()}`,
        name: user.name,
        email: user.email,
        role: user.role,
        status: 'active',
        joinedAt: new Date().toISOString()
      };
      setUserAccounts(prev => [...prev, newAcc]);
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: user.name,
      role: user.role,
      action: `Created a new ${user.role} account: "${user.name}" (${user.email})`,
      type: 'success'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 4. Role Switch Tab Auto-Sync
  useEffect(() => {
    const studentTabs = ['student-overview', 'student-learning', 'student-certifications', 'student-curriculum'];
    const adminTabs = ['admin-metrics', 'admin-users', 'admin-paths'];
    const evaluatorTabs = ['evaluator-queue', 'evaluator-analytics'];

    if (activeRole === 'student' && !studentTabs.includes(activeTab)) {
      setActiveTab('student-overview');
    } else if (activeRole === 'admin' && !adminTabs.includes(activeTab)) {
      setActiveTab('admin-metrics');
    } else if (activeRole === 'evaluator' && !evaluatorTabs.includes(activeTab)) {
      setActiveTab('evaluator-queue');
    }
  }, [activeRole]);

  // 5. Helper function to append to audit log feed
  const addAuditLog = (action: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const actorNames = {
      student: studentProgress.name,
      admin: 'Sarah Chen (Admin)',
      evaluator: 'Lead Instructor Kenji (Supervisor)'
    };

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: actorNames[activeRole] || 'System User',
      role: activeRole,
      action: action,
      type: type
    };

    setAuditLogs(prev => [newLog, ...prev]);
  };

  // 6. Sidebar Pending Counters
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'pending').length;

  if (!currentUser) {
    return (
      <AuthScreen 
        onAuthSuccess={handleAuthSuccess} 
        onRegisterUser={handleRegisterUser}
        existingAccounts={userAccounts} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" id="dojo-hub-shell-root">
      
      {/* Fixed Left Sidebar Navigation */}
      <Sidebar 
        activeRole={activeRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingSubmissionsCount={pendingSubmissionsCount}
        totalCredentialsCount={credentials.length}
      />

      {/* Main Container Layer */}
      <div className="flex-1 flex flex-col ml-64 min-h-screen" id="dojo-main-shell-container">
        
        {/* Sticky Top Navigation Bar */}
        <TopNavbar 
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          studentProgress={studentProgress}
          setStudentProgress={setStudentProgress}
          currentUser={currentUser}
          onSignOut={() => setCurrentUser(null)}
        />

        {/* Dynamic Main Content Dashboard Area */}
        <main className="flex-1 p-8 overflow-y-auto" id="dojo-content-viewport">
          
          {/* Student Panel */}
          {activeRole === 'student' && (
            <StudentDashboard 
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              studentProgress={studentProgress}
              setStudentProgress={setStudentProgress}
              certificationPaths={certificationPaths}
              submissions={submissions}
              setSubmissions={setSubmissions}
              credentials={credentials}
              addAuditLog={addAuditLog}
              userAccounts={userAccounts}
              tracks={tracks}
              categories={categories}
            />
          )}

          {/* Platform Admin Panel */}
          {activeRole === 'admin' && (
            <AdminDashboard 
              activeTab={activeTab}
              studentProgress={studentProgress}
              setStudentProgress={setStudentProgress}
              certificationPaths={certificationPaths}
              setCertificationPaths={setCertificationPaths}
              submissions={submissions}
              credentials={credentials}
              auditLogs={auditLogs}
              setAuditLogs={setAuditLogs}
              addAuditLog={addAuditLog}
              userAccounts={userAccounts}
              setUserAccounts={setUserAccounts}
              tracks={tracks}
              setTracks={setTracks}
              categories={categories}
              setCategories={setCategories}
            />
          )}

          {/* Evaluator Panel */}
          {activeRole === 'evaluator' && (
            <EvaluatorDashboard 
              activeTab={activeTab}
              studentProgress={studentProgress}
              setStudentProgress={setStudentProgress}
              submissions={submissions}
              setSubmissions={setSubmissions}
              credentials={credentials}
              setCredentials={setCredentials}
              officeHours={officeHours}
              setOfficeHours={setOfficeHours}
              addAuditLog={addAuditLog}
              userAccounts={userAccounts}
            />
          )}

        </main>
      </div>

    </div>
  );
}
