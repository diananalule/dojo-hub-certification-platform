import React, { useState } from 'react';
import { StudentProgress, CertificationPath, Submission, IssuedCredential, AuditLog, UserAccount } from '../types';
import { Track, Module, Topic } from '../tracksData';
import { jsPDF } from 'jspdf';
import { 
  Activity, 
  Users, 
  Layers, 
  History, 
  Plus, 
  CheckCircle, 
  ShieldAlert, 
  Award, 
  Trash2, 
  TrendingUp,
  Sliders,
  Server,
  Shield,
  UserCheck,
  UserX,
  PieChart,
  Download,
  BookOpen,
  Video,
  FileText,
  Clock,
  ExternalLink,
  Edit,
  Edit2,
  Wrench,
  Check,
  UploadCloud
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
  studentProgress: StudentProgress;
  setStudentProgress: React.Dispatch<React.SetStateAction<StudentProgress>>;
  certificationPaths: CertificationPath[];
  setCertificationPaths: React.Dispatch<React.SetStateAction<CertificationPath[]>>;
  submissions: Submission[];
  credentials: IssuedCredential[];
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  addAuditLog: (action: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  userAccounts: UserAccount[];
  setUserAccounts: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  tracks: Track[];
  setTracks: React.Dispatch<React.SetStateAction<Track[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function AdminDashboard({
  activeTab,
  studentProgress,
  setStudentProgress,
  certificationPaths,
  setCertificationPaths,
  submissions,
  credentials,
  auditLogs,
  setAuditLogs,
  addAuditLog,
  userAccounts,
  setUserAccounts,
  tracks,
  setTracks,
  categories,
  setCategories
}: AdminDashboardProps) {

  // Selected path for curriculum builder
  const [selectedBuilderPath, setSelectedBuilderPath] = useState<string>('path-intermediate');
  const [newModuleName, setNewModuleName] = useState<string>('');
  const [newRequiredPoints, setNewRequiredPoints] = useState<number>(200);

  // Segmented sub-tabs for curriculum builder
  const [activeBuilderSubTab, setActiveBuilderSubTab] = useState<string>('programs');

  // Certification Program (Track) Creation / Management States
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || 'track-hardware');
  const [progTitle, setProgTitle] = useState('');
  const [progDesc, setProgDesc] = useState('');
  const [progCategory, setProgCategory] = useState<string>('Hardware');
  const [progDifficulty, setProgDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [progDurationWeeks, setProgDurationWeeks] = useState<number>(12);
  const [progIcon, setProgIcon] = useState('🎓');

  // Course Category Editing States
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState<string>('');

  // Course Module Creation States
  const [modTitle, setModTitle] = useState('');
  const [modDesc, setModDesc] = useState('');
  const [modIsStandalone, setModIsStandalone] = useState(false);
  const [modQuizEnabled, setModQuizEnabled] = useState(true);

  // Course Topic/Lesson Creation States
  const [selectedModuleId, setSelectedModuleId] = useState<string>('');
  const [topTitle, setTopTitle] = useState('');
  const [topDesc, setTopDesc] = useState('');
  const [topDuration, setTopDuration] = useState('15:00');
  const [topVideoUrl, setTopVideoUrl] = useState('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4');
  const [topToolsStr, setTopToolsStr] = useState('');
  const [topDocsStr, setTopDocsStr] = useState('');
  const [topRefVideoUrl, setTopRefVideoUrl] = useState('https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4');

  const [topicMaterials, setTopicMaterials] = useState<string[]>([]);
  const [uploadFileState, setUploadFileState] = useState<{
    uploading: boolean;
    progress: number;
    fileName: string;
  }>({ uploading: false, progress: 0, fileName: '' });

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleMaterialUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateMaterialUpload(file.name);
    }
  };

  const simulateMaterialUpload = (fileName: string) => {
    setUploadFileState({
      uploading: true,
      progress: 0,
      fileName: fileName
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setUploadFileState({
          uploading: false,
          progress: 100,
          fileName: ''
        });
        setTopicMaterials(prev => [...prev, fileName]);
        addAuditLog(`Uploaded Course Handout material: "${fileName}"`, 'success');
      } else {
        setUploadFileState(prev => ({
          ...prev,
          progress: currentProgress
        }));
      }
    }, 120);
  };

  // Helper for student enrolments
  const getStudentEnrollments = (email: string) => {
    let enrolledIds: string[] = [];
    if (email === studentProgress.email) {
      try {
        const saved = localStorage.getItem('dojo_enrolled_course_ids');
        if (saved) enrolledIds = JSON.parse(saved);
      } catch (e) {}
      if (enrolledIds.length === 0) {
        enrolledIds = ['track-hardware']; // default fallback
      }
    } else {
      if (email === 'sophia.lin@dojo.edu') {
        enrolledIds = ['track-hardware', 'track-software'];
      } else if (email === 'devon.carter@dojo.edu') {
        enrolledIds = ['track-hardware', 'track-software', 'track-data'];
      } else if (email === 'aria.sterling@dojo.edu') {
        enrolledIds = ['track-hardware'];
      } else {
        enrolledIds = ['track-hardware'];
      }
    }
    const submissionTrackIds = submissions
      .filter(s => s.studentEmail === email && s.trackId)
      .map(s => s.trackId as string);
    
    return Array.from(new Set([...enrolledIds, ...submissionTrackIds]));
  };

  // Helper for supervisor evaluations
  const getSupervisorEvaluationsDone = (name: string) => {
    let base = 0;
    if (name.includes('Kenji')) base = 14;
    else if (name.includes('Tanaka')) base = 22;
    else if (name.includes('Amanda')) base = 8;
    
    const realTimeCount = submissions.filter(s => s.status !== 'pending' && s.evaluatedBy && s.evaluatedBy.includes(name)).length;
    return base + realTimeCount;
  };

  // Competency Editing State
  const [editingCompetency, setEditingCompetency] = useState<{
    moduleId: string;
    competencyId: string;
    title: string;
    description: string;
    validationRequirements: string;
    tools: string;
  } | null>(null);

  // Pre-Flight Publication Review State
  const [reviewingPublishTrack, setReviewingPublishTrack] = useState<Track | null>(null);

  // Handle creating a new Certification Program (Track)
  const handleCreateProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progTitle.trim() || !progDesc.trim()) return;

    const newTrackId = `track-${Date.now()}`;
    const newProgram: Track = {
      id: newTrackId,
      title: progTitle.trim(),
      category: progCategory,
      description: progDesc.trim(),
      difficulty: progDifficulty,
      durationWeeks: progDurationWeeks,
      icon: progIcon,
      modules: [],
      status: 'draft'
    };

    setTracks(prev => [...prev, newProgram]);
    addAuditLog(`Sarah Chen (Admin) created a new Certification Program (Draft): "${progTitle.trim()}"`, 'success');
    alert(`Successfully created Certification Program: "${progTitle.trim()}"! It is currently in DRAFT mode. Add modules and practical tasks/subheadings, then use the "Review & Publish" tool to make it live for students.`);

    // Reset fields
    setProgTitle('');
    setProgDesc('');
    setSelectedTrackId(newTrackId);
  };

  // Handle deleting a Certification Program (Track)
  const handleDeleteProgram = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId);
    if (!track) return;

    if (window.confirm(`⚠️ WARNING: Are you absolutely sure you want to delete the Certification Program: "${track.title}"? All course modules and topic lessons under it will be permanently deleted.`)) {
      setTracks(prev => prev.filter(t => t.id !== trackId));
      addAuditLog(`Sarah Chen (Admin) deleted Certification Program: "${track.title}"`, 'warning');
      alert(`Deleted Certification Program: "${track.title}"`);
      if (selectedTrackId === trackId) {
        setSelectedTrackId(tracks[0]?.id || '');
      }
    }
  };

  // Handle creating a new Course Module under a Track
  const handleCreateModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modTitle.trim() || !selectedTrackId) {
      alert("Please enter a module title and select a certification program!");
      return;
    }

    const newModuleId = `mod-${Date.now()}`;
    const newModule: Module = {
      id: newModuleId,
      title: modTitle.trim(),
      description: modDesc.trim() || `Course topics and practical labs for ${modTitle.trim()}.`,
      topics: [],
      quizEnabled: modQuizEnabled
    };

    setTracks(prev => prev.map(t => {
      if (t.id === selectedTrackId) {
        return {
          ...t,
          modules: [...t.modules, newModule]
        };
      }
      return t;
    }));

    addAuditLog(`Sarah Chen (Admin) created Course Module: "${modTitle.trim()}" under Program: "${tracks.find(t => t.id === selectedTrackId)?.title}"`, 'success');
    alert(`Successfully created Course Module: "${modTitle.trim()}"!`);

    setModTitle('');
    setModDesc('');
    setModIsStandalone(false);
    setModQuizEnabled(true);
    setSelectedModuleId(newModuleId);
  };

  // Handle deleting a Course Module
  const handleDeleteModule = (moduleId: string) => {
    if (!selectedTrackId) return;

    if (window.confirm(`Are you sure you want to delete this Course Module?`)) {
      setTracks(prev => prev.map(t => {
        if (t.id === selectedTrackId) {
          return {
            ...t,
            modules: t.modules.filter(m => m.id !== moduleId)
          };
        }
        return t;
      }));
      addAuditLog(`Sarah Chen (Admin) deleted Course Module.`, 'warning');
      alert(`Course Module deleted.`);
    }
  };

  // Handle creating a new topic/lesson under a module
  const handleCreateTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topTitle.trim() || !selectedTrackId || !selectedModuleId) {
      alert("Please specify a course name and select a target Course Module first!");
      return;
    }

    const newTopicId = `topic-${Date.now()}`;
    const newTopic: Topic = {
      id: newTopicId,
      title: topTitle.trim(),
      description: topDesc.trim() || 'No description provided.',
      duration: topDuration,
      videoUrl: topVideoUrl,
      subtitles: [
        { time: 0, text: `Welcome to ${topTitle.trim()}` },
        { time: 5, text: `In this section, we cover tools and core workflows.` }
      ],
      tools: topToolsStr ? topToolsStr.split(',').map(s => s.trim()) : [],
      documents: [
        ...(topDocsStr ? topDocsStr.split(',').map(s => s.trim()).filter(Boolean) : []),
        ...topicMaterials
      ],
      referenceVideoUrl: topRefVideoUrl || undefined
    };

    setTracks(prev => prev.map(t => {
      if (t.id === selectedTrackId) {
        const updatedModules = t.modules.map(m => {
          if (m.id === selectedModuleId) {
            return {
              ...m,
              topics: [...m.topics, newTopic]
            };
          }
          return m;
        });
        return { ...t, modules: updatedModules };
      }
      return t;
    }));

    addAuditLog(`Sarah Chen (Admin) added Topic/Lesson: "${topTitle.trim()}"`, 'success');
    alert(`Successfully added Topic/Lesson: "${topTitle.trim()}" with materials, tools, and reference videos!`);

    // Reset fields
    setTopTitle('');
    setTopDesc('');
    setTopDuration('15:00');
    setTopToolsStr('');
    setTopDocsStr('');
    setTopicMaterials([]);
  };

  // Handle deleting a topic/lesson
  const handleDeleteTopic = (moduleId: string, topicId: string) => {
    if (!selectedTrackId) return;

    if (window.confirm("Are you sure you want to delete this topic/lesson?")) {
      setTracks(prev => prev.map(t => {
        if (t.id === selectedTrackId) {
          const updatedModules = t.modules.map(m => {
            if (m.id === moduleId) {
              return {
                ...m,
                topics: m.topics.filter(tp => tp.id !== topicId)
              };
            }
            return m;
          });
          return { ...t, modules: updatedModules };
        }
        return t;
      }));
      addAuditLog("Sarah Chen (Admin) deleted Topic/Lesson.", "warning");
      alert("Topic/Lesson deleted.");
    }
  };

  // User search/filter
  const [userSearch, setUserSearch] = useState<string>('');
  const [directoryRoleFilter, setDirectoryRoleFilter] = useState<'student' | 'evaluator'>('student');

  // Handle adding module to path
  const handleAddModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleName.trim()) return;

    setCertificationPaths(prev => prev.map(path => {
      if (path.id === selectedBuilderPath) {
        const updatedModules = [...path.modules, newModuleName.trim()];
        addAuditLog(`Added new module "${newModuleName.trim()}" to ${path.title} Curriculum.`, 'success');
        return { ...path, modules: updatedModules };
      }
      return path;
    }));

    setNewModuleName('');
  };

  // Handle adjusting required points for path
  const handleUpdatePoints = (pathId: string, pts: number) => {
    setCertificationPaths(prev => prev.map(path => {
      if (path.id === pathId) {
        addAuditLog(`Adjusted points requirement for ${path.title} to ${pts} pts.`, 'warning');
        return { ...path, requiredPoints: pts };
      }
      return path;
    }));

    // If it's the student's active level, update totalRequiredPoints
    const updatedPath = certificationPaths.find(p => p.id === pathId);
    if (updatedPath && studentProgress.currentLevel === updatedPath.levelColor) {
      setStudentProgress(prev => ({ ...prev, totalRequiredPoints: pts }));
    }
  };

  // Handle toggling account suspension
  const handleToggleSuspension = (userId: string, currentStatus: 'active' | 'suspended') => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    const targetUser = userAccounts.find(u => u.id === userId);
    if (!targetUser) return;

    setUserAccounts(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, status: nextStatus };
      }
      return u;
    }));

    addAuditLog(`Sarah Chen (Admin) ${nextStatus === 'suspended' ? 'suspended' : 'activated'} the account of ${targetUser.name} (${targetUser.role}).`, nextStatus === 'suspended' ? 'warning' : 'success');
    alert(`Account of ${targetUser.name} has been successfully ${nextStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVATED'}!`);
  };

  // Handle account termination (permanent deletion)
  const handleTerminateAccount = (userId: string) => {
    const targetUser = userAccounts.find(u => u.id === userId);
    if (!targetUser) return;

    if (window.confirm(`⚠️ CRITICAL SECURITY WARNING: Are you absolutely sure you want to permanently TERMINATE and DELETE the account of ${targetUser.name} (${targetUser.role})? This action is immediate and cannot be undone.`)) {
      setUserAccounts(prev => prev.filter(u => u.id !== userId));
      addAuditLog(`Sarah Chen (Admin) permanently TERMINATED the account of ${targetUser.name} (${targetUser.role}).`, 'error');
      alert(`Account of ${targetUser.name} has been successfully deleted from the platform.`);
    }
  };

  // Generate a beautiful administrative platform performance report PDF
  const handleGenerateReport = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const width = doc.internal.pageSize.getWidth(); // 210mm
      const height = doc.internal.pageSize.getHeight(); // 297mm

      // Draw elegant report header
      doc.setFillColor(15, 23, 42); // Navy-950
      doc.rect(0, 0, width, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('DOJO HUB ACADEMY', 15, 18);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SYSTEM REPORT: PERFORMANCE & PROGRESS MONITORING', 15, 26);
      doc.text(`Generated: ${new Date().toLocaleString()}`, width - 15, 26, { align: 'right' });

      // Title/Sub-header
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('1. Platform Usage & General Metrics', 15, 55);

      // Draw metrics key value grid
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Total Enrolled Students:`, 15, 65);
      doc.text(`Total Grading Submissions:`, 15, 71);
      doc.text(`Total Issued Credentials:`, 15, 77);
      doc.text(`Audit Logs Recorded:`, 15, 83);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(`${userAccounts.filter(u => u.role === 'student').length} candidates`, 70, 65);
      doc.text(`${submissions.length} capstone & practical task projects`, 70, 71);
      doc.text(`${credentials.length} certificates issued on-chain`, 70, 77);
      doc.text(`${auditLogs.length} events logged`, 70, 83);

      // Separator line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(15, 90, width - 15, 90);

      // Progress monitoring section
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('2. Candidate Progress Directory', 15, 102);

      let yPos = 112;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Name / Contact', 15, yPos);
      doc.text('Active Level', 75, yPos);
      doc.text('Status', 140, yPos);
      doc.text('Performance Track', 170, yPos);

      doc.line(15, yPos + 3, width - 15, yPos + 3);
      yPos += 10;

      userAccounts.forEach((acc) => {
        if (yPos > height - 20) {
          doc.addPage();
          yPos = 20;
        }

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 23, 42);
        doc.text(acc.name, 15, yPos);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(acc.email, 15, yPos + 4);

        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        
        let level = 'N/A';
        if (acc.role === 'student') {
          level = acc.email === studentProgress.email ? studentProgress.currentLevel : acc.levelColor || 'Beginner';
        } else {
          level = 'Faculty Supervisor';
        }
        doc.text(level, 75, yPos);

        doc.text(acc.status.toUpperCase(), 140, yPos);

        const roleText = acc.role === 'student' ? 'Student Disciple' : 'Office Evaluator';
        doc.text(roleText, 170, yPos);

        doc.line(15, yPos + 7, width - 15, yPos + 7);
        yPos += 12;
      });

      // Download PDF
      doc.save('DojoHub_Platform_Usage_Report.pdf');
      addAuditLog('Sarah Chen (Admin) generated platform progress report PDF.', 'success');
      alert('Report PDF generated and downloaded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF report.');
    }
  };

  // Handle granting performance bonus points
  const handleAddBonusPoints = (userId: string, pointsToGrant: number) => {
    const targetUser = userAccounts.find(u => u.id === userId);
    if (!targetUser) return;

    // Sync in studentProgress state if it's the active logged-in student (Alex Mercer)
    if (targetUser.email === studentProgress.email) {
      setStudentProgress(prev => ({
        ...prev,
        points: prev.points + pointsToGrant
      }));
    }

    addAuditLog(`Sarah Chen (Admin) granted +${pointsToGrant} bonus points to ${targetUser.name}.`, 'success');
    alert(`Granted ${pointsToGrant} bonus points to ${targetUser.name}!`);
  };

  // Helper stats
  const totalSubmissionsCount = submissions.length;
  const pendingCount = submissions.filter(s => s.status === 'pending').length;
  const approvedCount = submissions.filter(s => s.status === 'approved').length;

  const studentsCount = userAccounts.filter(u => u.role === 'student').length;
  const supervisorsCount = userAccounts.filter(u => u.role === 'evaluator').length;
  const totalUsersCount = studentsCount + supervisorsCount;

  // Course Specific helpers
  const getTrackEnrollments = (trackId: string) => {
    const subs = submissions.filter(s => s.trackId === trackId);
    const uniqueFromSubs = new Set(subs.map(s => s.studentEmail));
    
    let baseCount = 0;
    if (trackId === 'track-hardware') baseCount = 2; // Alex Mercer, Aria Sterling
    else if (trackId === 'track-software') baseCount = 3; // Alex Mercer, Sophia Lin, Aria Sterling
    else if (trackId === 'track-data') baseCount = 1; // Devon Carter
    else baseCount = 1;

    return Math.max(baseCount, uniqueFromSubs.size);
  };

  const getTrackActiveLearners = (trackId: string) => {
    const subs = submissions.filter(s => s.trackId === trackId);
    const uniqueActive = new Set(subs.map(s => s.studentEmail));
    
    let baseActive = 0;
    if (trackId === 'track-hardware') baseActive = 1;
    else if (trackId === 'track-software') baseActive = 2;
    else if (trackId === 'track-data') baseActive = 1;
    else baseActive = 1;

    return Math.max(baseActive, uniqueActive.size);
  };

  // Helper for mapping submissions to courses/tracks
  const getTrackIdForSubmission = (sub: Submission) => {
    if (sub.trackId) return sub.trackId;
    if (sub.level === 'Beginner') return 'track-intern-sw';
    if (sub.level === 'Intermediate') return 'track-hardware';
    if (sub.level === 'Advanced') {
      if (sub.studentEmail === 'devon.carter@dojo.edu' || sub.studentEmail?.includes('devon') || sub.title?.toLowerCase().includes('data')) {
        return 'track-data';
      }
      return 'track-software';
    }
    if (sub.level === 'Expert') {
      if (sub.studentEmail === 'devon.carter@dojo.edu' || sub.studentEmail?.includes('devon') || sub.title?.toLowerCase().includes('data')) {
        return 'track-data';
      }
      return 'track-software';
    }
    return 'track-software';
  };

  // Helper for mapping credentials (certificates) to courses/tracks
  const getTrackIdForCredential = (cred: IssuedCredential) => {
    if (cred.level === 'Beginner') return 'track-intern-sw';
    if (cred.level === 'Intermediate') return 'track-hardware';
    if (cred.level === 'Advanced') {
      if (cred.studentEmail === 'devon.carter@dojo.edu' || cred.studentEmail?.includes('devon') || cred.studentName?.includes('Devon')) {
        return 'track-data';
      }
      return 'track-software';
    }
    if (cred.level === 'Expert') {
      if (cred.studentEmail === 'devon.carter@dojo.edu' || cred.studentEmail?.includes('devon') || cred.studentName?.includes('Devon')) {
        return 'track-data';
      }
      return 'track-software';
    }
    return 'track-software';
  };

  // Platform-Wide Metrics Calculations
  const platformCertsAwarded = credentials.length;
  const platformEnrollments = tracks.reduce((sum, t) => sum + getTrackEnrollments(t.id), 0);
  const platformCompletionRate = platformEnrollments > 0 ? (platformCertsAwarded / platformEnrollments) * 150 : 0; // wait, let's use actual formula or cap it beautifully
  const platformCompletionPercentage = platformEnrollments > 0 ? Math.min(100, (platformCertsAwarded / platformEnrollments) * 100) : 0;
  const platformPendingCerts = submissions.filter(s => s.status === 'pending' && s.submissionType !== 'competence').length;

  return (
    <div className="space-y-8" id="admin-dashboard">
      
      {/* ADMIN METRICS TAB */}
      {activeTab === 'admin-metrics' && (
        <div className="space-y-8" id="tab-admin-metrics">
          
          {/* Main KPI Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="admin-kpi-grid">
            
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold block">Total Users (Students vs Supervisors)</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">{studentsCount} Students vs {supervisorsCount} Supervisors</h3>
                <p className="text-xs text-indigo-600 font-semibold">
                  {totalUsersCount} Total Registered Users
                </p>
              </div>
              <div className="w-12 h-12 bg-navy-50 rounded-lg flex items-center justify-center text-navy-950 border border-navy-100 shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold block">Total Students Enrolled in Courses</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">{studentsCount} Students</h3>
                <p className="text-xs text-emerald-600 font-semibold">Actively enrolled across flagship pathways</p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1 text-left">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold block">Pending Grading Tasks</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">{pendingCount} Tasks Pending</h3>
                <p className="text-xs text-red-600 font-semibold">Awaiting proctor evaluation</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600 border border-red-100 shrink-0">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="admin-charts-row">
            
            {/* Course-Specific Analytics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6 text-left" id="course-analytics-card">
              <div>
                <h3 className="text-base font-sans font-bold text-deep-black">Course-Specific Analytics</h3>
                <p className="text-xs text-gray-400">Detailed enrollment, active learners, and completions reviews across courses.</p>
              </div>

              <div className="space-y-4 pt-2 overflow-y-auto max-h-[380px]" id="course-analytics-list">
                {tracks.map((track) => {
                  const enrollments = getTrackEnrollments(track.id);
                  const activeLearners = getTrackActiveLearners(track.id);
                  const totalTrackSubmissions = submissions.filter(s => s.trackId === track.id).length;
                  const reviewedTrackSubmissions = submissions.filter(s => s.trackId === track.id && s.status !== 'pending').length;
                  
                  // New Metrics Calculations for this course
                  const trackCerts = credentials.filter(c => getTrackIdForCredential(c) === track.id).length;
                  const trackPendingCerts = submissions.filter(s => getTrackIdForSubmission(s) === track.id && s.status === 'pending' && s.submissionType !== 'competence').length;
                  const completionRate = enrollments > 0 ? (trackCerts / enrollments) * 100 : 0;
                  
                  let badgeColor = 'bg-blue-50 text-blue-700 border-blue-150';
                  if (track.category === 'Hardware') badgeColor = 'bg-red-50 text-red-700 border-red-150';
                  if (track.category === 'Data Science') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-150';

                  return (
                    <div key={track.id} className="p-4 rounded-xl border border-gray-150 bg-gray-50/40 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-sans font-bold text-sm text-deep-black">{track.title}</h4>
                          <span className={`inline-block px-2 py-0.5 mt-1 rounded text-[9px] font-mono font-bold uppercase border ${badgeColor}`}>
                            {track.category}
                          </span>
                        </div>
                        <span className="text-lg">{track.icon}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="bg-white p-2 rounded-lg border border-gray-200/60">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block text-left pl-1">Enrollments</span>
                          <strong className="text-xs font-sans text-deep-black block text-left pl-1 mt-0.5">{enrollments} Students</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200/60">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block text-left pl-1">Active Learners</span>
                          <strong className="text-xs font-sans text-deep-black block text-left pl-1 mt-0.5">{activeLearners} Active</strong>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200/60">
                          <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block text-left pl-1">Submissions</span>
                          <strong className="text-xs font-sans text-deep-black block text-left pl-1 mt-0.5">{totalTrackSubmissions} ({reviewedTrackSubmissions} rev)</strong>
                        </div>
                        
                        <div className="bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/60">
                          <span className="text-[9px] font-mono text-emerald-700 uppercase tracking-wider block text-left pl-1 font-bold">Completion Rate</span>
                          <strong className="text-xs font-sans text-emerald-950 block text-left pl-1 mt-0.5">{completionRate.toFixed(1)}%</strong>
                        </div>
                        <div className="bg-blue-50/40 p-2 rounded-lg border border-blue-100/60">
                          <span className="text-[9px] font-mono text-blue-700 uppercase tracking-wider block text-left pl-1 font-bold">Certs Awarded</span>
                          <strong className="text-xs font-sans text-blue-950 block text-left pl-1 mt-0.5">{trackCerts} Issued</strong>
                        </div>
                        <div className="bg-amber-50/40 p-2 rounded-lg border border-amber-100/60">
                          <span className="text-[9px] font-mono text-amber-700 uppercase tracking-wider block text-left pl-1 font-bold">Certs Pending</span>
                          <strong className="text-xs font-sans text-amber-950 block text-left pl-1 mt-0.5">{trackPendingCerts} Queue</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Platform-Wide Completion & Certification Metrics */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6 text-left" id="admin-funnel-card">
              <div>
                <h3 className="text-base font-sans font-bold text-deep-black">Platform-Wide Certification Metrics</h3>
                <p className="text-xs text-gray-400">Overview of student completion performance and certification throughput across the platform.</p>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4" id="funnel-stats">
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center space-y-1">
                  <span className="text-[10px] font-mono text-emerald-600 font-bold uppercase block">Completion Rate</span>
                  <div className="text-2xl font-sans font-extrabold text-emerald-900">{platformCompletionPercentage.toFixed(1)}%</div>
                  <span className="text-[10px] text-gray-400 block">Awarded / Enrollments</span>
                </div>
                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 text-center space-y-1">
                  <span className="text-[10px] font-mono text-blue-600 font-bold uppercase block">Certificates Awarded</span>
                  <div className="text-2xl font-sans font-extrabold text-blue-900">{platformCertsAwarded}</div>
                  <span className="text-[10px] text-gray-400 block">On-Chain Credentials</span>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 text-center space-y-1">
                  <span className="text-[10px] font-mono text-amber-600 font-bold uppercase block">Pending Certificates</span>
                  <div className="text-2xl font-sans font-extrabold text-amber-900">{platformPendingCerts}</div>
                  <span className="text-[10px] text-gray-400 block">Awaiting Evaluation</span>
                </div>
              </div>

              {/* Administrative Quick Controls */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs space-y-3" id="admin-quick-actions">
                <div className="font-mono text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Governance Shortcuts
                </div>
                <div className="grid grid-cols-1" id="admin-shortcut-buttons">
                  <button 
                    onClick={() => {
                      addAuditLog("Admin triggered manual system backup.", "info");
                      alert("Registry Database backed up securely. 1 SHA-256 state hash pushed to backup storage.");
                    }}
                    className="bg-navy-950 hover:bg-navy-900 text-white font-sans font-semibold py-2 rounded text-center cursor-pointer transition-colors"
                  >
                    Backup Registry State
                  </button>
                </div>
                
                <button
                  onClick={handleGenerateReport}
                  className="w-full bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-semibold py-2.5 rounded text-center cursor-pointer transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Generate Progress & Usage Report (PDF)
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* USER DIRECTORY TAB */}
      {activeTab === 'admin-users' && (
        <div className="space-y-6" id="tab-admin-users">
          
          {/* Aggregate Directory Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6" id="directory-analytics-grid">
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Total Enrolled</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">
                  {userAccounts.filter(u => u.role === 'student').length} Students
                </h3>
                <p className="text-[10px] text-gray-500">Active pathway candidates</p>
              </div>
              <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center text-navy-950 border border-navy-100">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Evaluator Pool</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">
                  {userAccounts.filter(u => u.role === 'evaluator').length} Supervisors
                </h3>
                <p className="text-[10px] text-gray-500">Authorized grading faculty</p>
              </div>
              <div className="w-10 h-10 bg-crimson-50 rounded-lg flex items-center justify-center text-crimson-600 border border-crimson-100">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Completion Rate</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">71% Done</h3>
                <p className="text-[10px] text-green-600 font-semibold">Average academy progress</p>
              </div>
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600 border border-green-100">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider font-bold">Suspended Accounts</span>
                <h3 className="text-2xl font-sans font-bold text-deep-black">
                  {userAccounts.filter(u => u.status === 'suspended').length} Suspended
                </h3>
                <p className="text-[10px] text-yellow-600 font-semibold">Access restricted temporarily</p>
              </div>
              <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center text-yellow-600 border border-yellow-100">
                <ShieldAlert className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left" id="directory-container">
            {/* Table Header Filter & Switching Tabs */}
            <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4" id="directory-header">
              <div className="space-y-2">
                <h3 className="text-base font-sans font-bold text-deep-black">Dojo User Governance</h3>
                <p className="text-xs text-gray-400">Manage student and supervisor accounts, and toggle access permissions.</p>
                
                {/* Switcher buttons */}
                <div className="flex gap-2 pt-2" id="directory-role-switcher">
                  <button
                    onClick={() => setDirectoryRoleFilter('student')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                      directoryRoleFilter === 'student'
                        ? 'bg-crimson-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🥋 Disciple Candidates ({userAccounts.filter(u => u.role === 'student').length})
                  </button>
                  <button
                    onClick={() => setDirectoryRoleFilter('evaluator')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer ${
                      directoryRoleFilter === 'evaluator'
                        ? 'bg-crimson-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    🛡️ Senior Supervisors ({userAccounts.filter(u => u.role === 'evaluator').length})
                  </button>
                </div>
              </div>
              <input
                type="text"
                placeholder={`Search ${directoryRoleFilter}s by name or email...`}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-xs rounded-lg px-4 py-3.5 w-full md:w-80 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
              />
            </div>

               {/* List Table */}
            <div className="overflow-x-auto" id="candidates-table-container">
              <table className="w-full text-left border-collapse" id="candidates-table">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 font-mono text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    <th className="py-4 px-6">Name & Contact</th>
                    <th className="py-4 px-6">System Role</th>
                    <th className="py-4 px-6">Registry Joined Date</th>
                    <th className="py-4 px-6">Activity & Performance Stats</th>
                    <th className="py-4 px-6 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-600 divide-y divide-gray-100" id="candidates-table-body">
                  {userAccounts.filter(acc => {
                    const matchesSearch = acc.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                          acc.email.toLowerCase().includes(userSearch.toLowerCase());
                    const matchesRole = acc.role === directoryRoleFilter;
                    return matchesSearch && matchesRole;
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400 italic font-sans">
                        No active {directoryRoleFilter} accounts found matching query.
                      </td>
                    </tr>
                  ) : (
                    userAccounts.filter(acc => {
                      const matchesSearch = acc.name.toLowerCase().includes(userSearch.toLowerCase()) || 
                                            acc.email.toLowerCase().includes(userSearch.toLowerCase());
                      const matchesRole = acc.role === directoryRoleFilter;
                      return matchesSearch && matchesRole;
                    }).map((acc) => {
                      let currentPointsText = "";
                      let levelText = "";
                      let levelColorClass = "bg-gray-400";
                      
                      if (acc.role === 'student') {
                        const isAlex = acc.email === studentProgress.email;
                        const pts = isAlex ? studentProgress.points : (acc.email === 'sophia.lin@dojo.edu' ? 310 : (acc.email === 'devon.carter@dojo.edu' ? 500 : 80));
                        const maxPts = isAlex ? studentProgress.totalRequiredPoints : (acc.email === 'sophia.lin@dojo.edu' ? 350 : (acc.email === 'devon.carter@dojo.edu' ? 500 : 100));
                        const level = isAlex ? studentProgress.currentLevel : acc.levelColor || 'Beginner';
                        
                        levelText = level === 'Beginner' ? 'Beginner (Foundations)' : level === 'Intermediate' ? 'Intermediate (Application)' : level === 'Advanced' ? 'Advanced (Competence)' : 'Expert (Capstone & Mastery)';
                        currentPointsText = `${pts} / ${maxPts} pts`;
                        
                        levelColorClass = 
                           level === 'Beginner' ? 'bg-gray-200 border border-gray-400 text-gray-700' :
                           level === 'Intermediate' ? 'bg-yellow-400 text-yellow-900' :
                           level === 'Advanced' ? 'bg-green-500 text-white' : 'bg-black text-white';
                      }

                      return (
                        <tr key={acc.id} className="hover:bg-gray-50/50">
                          <td className="py-4 px-6 font-medium">
                            <div className="font-sans font-bold text-deep-black">{acc.name}</div>
                            <div className="text-[11px] text-gray-400 font-mono">{acc.email}</div>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold capitalize text-navy-950">
                            {acc.role === 'student' ? '👨‍💻 Candidate' : '🛡️ Supervisor'}
                          </td>
                          <td className="py-4 px-6 font-mono text-gray-400 text-[11px]">
                            {new Date(acc.joinedAt).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">
                            {acc.role === 'student' ? (
                              (() => {
                                const numCerts = credentials.filter(c => c.studentEmail === acc.email && c.status === 'active').length;
                                const enrolledTracks = getStudentEnrollments(acc.email);
                                const cumulativeEnrolments = enrolledTracks.length;
                                const activeEnrolments = Math.max(0, cumulativeEnrolments - numCerts);
                                
                                return (
                                  <div className="space-y-1 font-sans text-[11px]">
                                    <div className="flex items-center gap-1.5 font-bold text-amber-850">
                                      <Award className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span>Certificates: <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">{numCerts}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>Cumulative Enrolments: <span className="font-bold text-gray-800">{cumulativeEnrolments}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                      <Activity className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                      <span>Active Enrolments: <span className="font-bold text-gray-800">{activeEnrolments}</span></span>
                                    </div>
                                  </div>
                                );
                              })()
                            ) : (
                              (() => {
                                const evalsDone = getSupervisorEvaluationsDone(acc.name);
                                const pendingEvals = submissions.filter(s => s.status === 'pending').length;
                                
                                return (
                                  <div className="space-y-1 font-sans text-[11px]">
                                    <div className="flex items-center gap-1.5 font-bold text-crimson-850">
                                      <CheckCircle className="w-3.5 h-3.5 text-crimson-600 shrink-0" />
                                      <span>Cumulative Evaluations: <span className="bg-crimson-100 text-crimson-800 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold">{evalsDone}</span></span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-gray-500">
                                      <Clock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                      <span>Pending Queue: <span className="font-bold text-gray-800">{pendingEvals}</span></span>
                                    </div>
                                  </div>
                                );
                              })()
                            )}
                          </td>

                          <td className="py-4 px-6 text-right space-x-2">
                            <button
                              onClick={() => handleToggleSuspension(acc.id, acc.status)}
                              className={`font-sans font-bold px-3 py-1.5 rounded text-[11px] transition-all cursor-pointer border ${
                                acc.status === 'active'
                                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
                                  : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100'
                              }`}
                            >
                              {acc.status === 'active' ? 'Suspend Privilege' : 'Reactivate Privilege'}
                            </button>
                            <button
                              onClick={() => handleTerminateAccount(acc.id)}
                              className="font-sans font-bold px-3 py-1.5 rounded text-[11px] bg-red-600 hover:bg-red-700 text-white transition-all cursor-pointer inline-flex items-center gap-1"
                            >
                              <UserX className="w-3 h-3" /> Terminate
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* CURRICULUM BUILDER TAB */}
      {activeTab === 'admin-paths' && (
        <div className="space-y-8" id="tab-admin-paths">
          
          {/* Sub-tab segmented control */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveBuilderSubTab('programs')}
              className={`py-3 px-6 font-sans font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeBuilderSubTab === 'programs'
                  ? 'border-crimson-600 text-crimson-600 border-b-crimson-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🎓 Certification Programs
            </button>
            <button
              onClick={() => setActiveBuilderSubTab('courses')}
              className={`py-3 px-6 font-sans font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeBuilderSubTab === 'courses'
                  ? 'border-crimson-600 text-crimson-600 border-b-crimson-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              📚 Course & Topics (Lessons)
            </button>
            <button
              onClick={() => setActiveBuilderSubTab('levels')}
              className={`py-3 px-6 font-sans font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeBuilderSubTab === 'levels'
                  ? 'border-crimson-600 text-crimson-600 border-b-crimson-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚙️ Syllabus Levels
            </button>
            <button
              onClick={() => setActiveBuilderSubTab('categories')}
              className={`py-3 px-6 font-sans font-bold text-sm border-b-2 transition-all cursor-pointer ${
                activeBuilderSubTab === 'categories'
                  ? 'border-crimson-600 text-crimson-600 border-b-crimson-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🏷️ Course Categories
            </button>
          </div>

          {/* Sub-tab content: PROGRAMS */}
          {activeBuilderSubTab === 'programs' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="builder-programs-layout">
              {/* Left Column: Create new program form */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-4 h-fit">
                <div>
                  <h3 className="text-base font-sans font-bold text-deep-black flex items-center gap-2">
                    <Plus className="w-5 h-5 text-crimson-600" />
                    New Program
                  </h3>
                  <p className="text-xs text-gray-500">Define a new on-chain certification program pathway.</p>
                </div>

                <form onSubmit={handleCreateProgram} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Program Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Cybersecurity Specialist Track"
                      value={progTitle}
                      onChange={(e) => setProgTitle(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Category</label>
                      <select
                        value={progCategory}
                        onChange={(e: any) => setProgCategory(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                      >
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Weeks Duration</label>
                      <input
                        type="number"
                        min={1}
                        max={52}
                        value={progDurationWeeks}
                        onChange={(e) => setProgDurationWeeks(Number(e.target.value))}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Difficulty</label>
                      <select
                        value={progDifficulty}
                        onChange={(e: any) => setProgDifficulty(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Launcher Emoji</label>
                      <input
                        type="text"
                        value={progIcon}
                        onChange={(e) => setProgIcon(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-mono font-bold text-gray-400 uppercase tracking-wider">Syllabus Description</label>
                    <textarea
                      placeholder="Objectives and requirements scope of the program..."
                      value={progDesc}
                      onChange={(e) => setProgDesc(e.target.value)}
                      rows={3}
                      className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
                  >
                    Deploy Program Path
                  </button>
                </form>
              </div>

              {/* Right Column: Manage current tracks */}
              <div className="lg:col-span-2 space-y-6 text-left">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-sans font-bold text-deep-black mb-1">Active Certification Programs ({tracks.length})</h3>
                  <p className="text-xs text-gray-400 mb-6">Manage high-level details and configure program parameters.</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tracks.map((track) => (
                      <div key={track.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex flex-col justify-between space-y-4 hover:bg-white hover:border-gray-300 transition-all">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{track.icon}</span>
                            <div className="flex items-center gap-1.5">
                              {track.status === 'draft' ? (
                                <span className="bg-amber-150 border border-amber-300 font-mono text-[9px] font-extrabold text-amber-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Draft
                                </span>
                              ) : (
                                <span className="bg-emerald-150 border border-emerald-300 font-mono text-[9px] font-extrabold text-emerald-800 px-2 py-0.5 rounded uppercase tracking-wider">
                                  Live
                                </span>
                              )}
                              <span className="bg-navy-950 font-mono text-[10px] font-bold text-white px-2.5 py-0.5 rounded border border-navy-800">
                                {track.category}
                              </span>
                            </div>
                          </div>
                          <div>
                            <h4 className="font-sans font-bold text-deep-black text-sm">{track.title}</h4>
                            <p className="text-xs text-gray-500 line-clamp-2 mt-1">{track.description}</p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3 flex items-center justify-between text-xs font-mono text-gray-400">
                          <span>{track.durationWeeks} Weeks duration</span>
                          <span>{track.difficulty}</span>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedTrackId(track.id);
                              setActiveBuilderSubTab('courses');
                            }}
                            className="bg-white hover:bg-gray-100 text-navy-950 border border-gray-200 font-sans font-semibold text-xs py-1.5 px-3 rounded-lg flex-1 cursor-pointer transition-colors text-center"
                          >
                            Manage Courses
                          </button>
                          <button
                            onClick={() => handleDeleteProgram(track.id)}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 font-sans font-bold text-xs p-1.5 rounded-lg cursor-pointer transition-colors flex items-center justify-center shrink-0"
                            title="Delete Program"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sub-tab content: COURSES & TOPICS */}
          {activeBuilderSubTab === 'courses' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="builder-courses-layout">
              {/* Left Column: Manage courses (Modules) & Topics form */}
              <div className="space-y-6">
                
                {/* 1. Track Selector */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-3">
                  <h4 className="text-sm font-sans font-bold text-deep-black">1. Select Target Certification Program</h4>
                  <select
                    value={selectedTrackId}
                    onChange={(e) => {
                      setSelectedTrackId(e.target.value);
                      const track = tracks.find(t => t.id === e.target.value);
                      setSelectedModuleId(track?.modules[0]?.id || '');
                    }}
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2.5 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-semibold"
                  >
                    {tracks.map(t => (
                      <option key={t.id} value={t.id}>{t.icon} {t.title}</option>
                    ))}
                  </select>
                </div>

                {/* 2. Create Course (Module) Form */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-4">
                  <div>
                    <h3 className="text-sm font-sans font-bold text-deep-black flex items-center gap-2">
                      <Layers className="w-4 h-4 text-crimson-600" />
                      Create Course Module
                    </h3>
                    <p className="text-xs text-gray-500">Append a module group within the selected program.</p>
                  </div>

                  <form onSubmit={handleCreateModule} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Module Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Module 3: Advanced Hardware Prototyping"
                        value={modTitle}
                        onChange={(e) => setModTitle(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Description</label>
                      <input
                        type="text"
                        placeholder="Core learning goals and lab overview..."
                        value={modDesc}
                        onChange={(e) => setModDesc(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 py-1 text-xs font-sans text-gray-600">
                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-navy-950">
                        <input
                          type="checkbox"
                          checked={modIsStandalone}
                          onChange={(e) => setModIsStandalone(e.target.checked)}
                          className="rounded border-gray-300 text-crimson-600 focus:ring-crimson-500"
                        />
                        <span>Standalone Module (No Subtopics)</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer hover:text-navy-950">
                        <input
                          type="checkbox"
                          checked={modQuizEnabled}
                          onChange={(e) => setModQuizEnabled(e.target.checked)}
                          className="rounded border-gray-300 text-crimson-600 focus:ring-crimson-500"
                        />
                        <span>Enable Chapter Quiz</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors"
                    >
                      Append Course Module
                    </button>
                  </form>
                </div>

                {/* 3. Create Topic/Lesson Form */}
                {(() => {
                  const track = tracks.find(t => t.id === selectedTrackId);
                  const modules = track?.modules || [];

                  return (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-4">
                      <div>
                        <h3 className="text-sm font-sans font-bold text-deep-black flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-crimson-600" />
                          Create Lesson Topic
                        </h3>
                        <p className="text-xs text-gray-500">Add a course content topic node with proctor reference materials.</p>
                      </div>

                      {modules.length === 0 ? (
                        <div className="text-xs text-gray-400 italic">Create a Course Module first before adding topics.</div>
                      ) : (
                        <form onSubmit={handleCreateTopic} className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Target Module</label>
                            <select
                              value={selectedModuleId}
                              onChange={(e) => setSelectedModuleId(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-semibold"
                            >
                              <option value="">-- Choose Module --</option>
                              {modules.map(m => (
                                <option key={m.id} value={m.id}>{m.title}</option>
                              ))}
                            </select>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Topic Title</label>
                            <input
                              type="text"
                              placeholder="e.g. Topic 1.3: Real-Time Wave Audio Synthesizer"
                              value={topTitle}
                              onChange={(e) => setTopTitle(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Topic Description</label>
                            <textarea
                              placeholder="Describe the requirement objectives..."
                              value={topDesc}
                              onChange={(e) => setTopDesc(e.target.value)}
                              rows={2}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Duration (e.g. 15:45)</label>
                              <input
                                type="text"
                                placeholder="15:40"
                                value={topDuration}
                                onChange={(e) => setTopDuration(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                                required
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Course Tools List</label>
                              <input
                                type="text"
                                placeholder="React DevTools, Web Audio API"
                                value={topToolsStr}
                                onChange={(e) => setTopToolsStr(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Training Lecture Video URL</label>
                            <input
                              type="text"
                              value={topVideoUrl}
                              onChange={(e) => setTopVideoUrl(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase">Reference Proctor Competence Video URL (Human Recorded)</label>
                            <input
                              type="text"
                              value={topRefVideoUrl}
                              onChange={(e) => setTopRefVideoUrl(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase block">Course Handouts & Lab Guides</label>
                            
                            {/* Hidden file input */}
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept=".pdf,.docx,.doc,.zip,.txt,.json,.xls,.xlsx,.ppt,.pptx"
                              onChange={handleMaterialUpload}
                            />

                            {/* Currently Uploaded Materials list */}
                            {topicMaterials.length > 0 && (
                              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200/60 space-y-1.5">
                                <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">Attached materials ({topicMaterials.length})</span>
                                <div className="space-y-1">
                                  {topicMaterials.map((mat, idx) => (
                                    <div key={idx} className="bg-white px-2 py-1.5 rounded border border-gray-150 flex items-center justify-between gap-2 shadow-sm">
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="font-sans font-medium text-[11px] text-gray-700 truncate" title={mat}>{mat}</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setTopicMaterials(prev => prev.filter((_, i) => i !== idx));
                                          addAuditLog(`Removed attached material "${mat}".`, 'warning');
                                        }}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors cursor-pointer shrink-0"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Upload Area / Dropzone */}
                            <div
                              onClick={() => {
                                if (!uploadFileState.uploading) fileInputRef.current?.click();
                              }}
                              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
                                uploadFileState.uploading 
                                  ? 'border-blue-300 bg-blue-50/25 pointer-events-none' 
                                  : 'border-gray-200 hover:border-crimson-400 hover:bg-gray-50/50'
                              }`}
                            >
                              {uploadFileState.uploading ? (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-crimson-600" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span className="text-xs font-semibold text-gray-700">Uploading {uploadFileState.fileName}...</span>
                                  </div>
                                  <div className="w-full bg-gray-150 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-crimson-600 h-1.5 rounded-full transition-all duration-150" 
                                      style={{ width: `${uploadFileState.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-[10px] font-mono text-gray-400">{uploadFileState.progress}% uploaded</span>
                                </div>
                              ) : (
                                <div className="space-y-1.5 py-1">
                                  <div className="flex justify-center">
                                    <UploadCloud className="w-6 h-6 text-gray-400" />
                                  </div>
                                  <div>
                                    <span className="text-xs font-sans font-semibold text-gray-700 block">Click to upload syllabus handout</span>
                                    <span className="text-[10px] font-sans text-gray-400 block mt-0.5">Accepts PDF, Word, ZIP, JSON, Excel, PPT files up to 50MB</span>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Comma separated text input as fallback or alternative for remote URLs */}
                            <div className="space-y-1 mt-2">
                              <span className="text-[9px] font-sans text-gray-400 block font-medium">Or input custom file names or handout URLs (comma-separated):</span>
                              <input
                                type="text"
                                placeholder="Prototyping Labs Handbook PDF, Lab Rubric Guide PDF"
                                value={topDocsStr}
                                onChange={(e) => setTopDocsStr(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="w-full bg-navy-950 hover:bg-navy-900 text-white font-sans font-bold text-xs py-2 rounded-lg cursor-pointer transition-colors"
                          >
                            Add Lesson Topic Node
                          </button>
                        </form>
                      )}
                    </div>
                  );
                })()}

              </div>

              {/* Right Column: Visual Directory of Selected Program's Courses & Topics */}
              <div className="lg:col-span-2 space-y-6 text-left">
                {(() => {
                  const track = tracks.find(t => t.id === selectedTrackId);
                  if (!track) {
                    return (
                      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-center py-12 text-gray-400">
                        Select a target certification program from the selector.
                      </div>
                    );
                  }

                  return (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-4">
                      <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-2xl mr-2">{track.icon}</span>
                          <h3 className="text-lg font-sans font-bold text-deep-black inline-block">{track.title} Course Syllabus Structure</h3>
                          <p className="text-xs text-gray-400 mt-1">Below are the Course Modules and Topics currently deployed for this program.</p>
                        </div>
                        <span className="bg-gray-100 font-mono text-xs font-bold text-gray-600 px-3 py-1 rounded-full border border-gray-200 self-start sm:self-center">
                          {track.modules.length} modules
                        </span>
                      </div>

                      {/* PRE-FLIGHT REVIEW & PUBLICATION STATE CARD */}
                      <div className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-sans ${
                        track.status === 'draft' 
                          ? 'bg-amber-50/70 border-amber-200 text-amber-950' 
                          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      }`}>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold">
                            {track.status === 'draft' ? (
                              <>
                                <span className="bg-amber-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider font-extrabold animate-pulse">DRAFT MODE</span>
                                <span className="text-amber-800 text-[11px]">Review & Validation Required</span>
                              </>
                            ) : (
                              <>
                                <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.5 rounded uppercase font-mono tracking-wider font-extrabold">LIVE</span>
                                <span className="text-emerald-800 text-[11px]">Published to Candidates</span>
                              </>
                            )}
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium font-sans">
                            {track.status === 'draft' 
                              ? "This certification is currently hidden from candidates. Configure your modules, topics, and requirement verification rubrics, then click the button to thoroughly verify and publish." 
                              : "This certification program is live and fully accessible to student candidates. Students can enroll, stream topics, and submit lab code and screen recordings for verification."
                            }
                          </p>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => setReviewingPublishTrack(track)}
                          className={`px-4 py-2.5 rounded-lg font-sans font-extrabold text-xs cursor-pointer transition-all shrink-0 flex items-center gap-2 shadow-sm ${
                            track.status === 'draft'
                              ? 'bg-amber-600 hover:bg-amber-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          <span>{track.status === 'draft' ? '🚀' : '👁️'}</span>
                          <span>{track.status === 'draft' ? 'Review & Publish Pathway' : 'Re-verify & Preview'}</span>
                        </button>
                      </div>

                      {/* Course-Wide configurations (Exam toggle) */}
                      <div className="bg-navy-50/60 border border-navy-100 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans text-navy-950">
                        <div className="flex items-center gap-2">
                          <Sliders className="w-4 h-4 text-crimson-600" />
                          <span className="font-bold">Course-Wide Configurations</span>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer hover:text-crimson-700 font-semibold">
                          <input
                            type="checkbox"
                            checked={track.examEnabled !== false}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setTracks(prev => prev.map(t => {
                                if (t.id === track.id) {
                                  return { ...t, examEnabled: isChecked };
                                }
                                return t;
                              }));
                              addAuditLog(`Toggled final exam for program "${track.title}" to ${isChecked}`, 'info');
                            }}
                            className="rounded border-gray-300 text-crimson-600 focus:ring-crimson-500"
                          />
                          <span>Enable Final Course Exam & Certification Assessment</span>
                        </label>
                      </div>

                      {track.modules.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 italic text-xs">
                          No course modules exist yet. Create a course module using the form on the left.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {track.modules.map((mod) => (
                            <div key={mod.id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
                              <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                  <h4 className="font-sans font-bold text-deep-black text-sm">{mod.title}</h4>
                                  <p className="text-xs text-gray-500">{mod.description}</p>
                                  
                                  {/* Module Config Toggles */}
                                  <div className="flex flex-wrap items-center gap-4 pt-1.5 text-xs font-sans text-gray-500">
                                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-navy-950">
                                      <input
                                        type="checkbox"
                                        checked={mod.quizEnabled !== false}
                                        onChange={(e) => {
                                          const isChecked = e.target.checked;
                                          setTracks(prev => prev.map(t => {
                                            if (t.id === selectedTrackId) {
                                              return {
                                                ...t,
                                                modules: t.modules.map(m => m.id === mod.id ? { ...m, quizEnabled: isChecked } : m)
                                              };
                                            }
                                            return t;
                                          }));
                                          addAuditLog(`Toggled chapter quiz for module "${mod.title}" to ${isChecked}`, 'info');
                                        }}
                                        className="rounded border-gray-300 text-crimson-600 focus:ring-crimson-500"
                                      />
                                      <span className="font-medium">Chapter Quiz Enabled</span>
                                    </label>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleDeleteModule(mod.id)}
                                  className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-200/50 transition-colors cursor-pointer shrink-0 ml-2"
                                  title="Delete Course Module"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Lesson Topics List inside each module in the precise position of Module Requirements */}
                              <div className="bg-white border border-gray-150 rounded-xl p-4.5 space-y-3.5 text-xs">
                                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                  <span className="font-bold font-sans text-navy-950 text-sm flex items-center gap-1.5" id={`module-topics-header-${mod.id}`}>
                                    <BookOpen className="w-4 h-4 text-crimson-600" />
                                    Module Lesson Topics ({mod.topics.length})
                                  </span>
                                  <span className="text-[10px] text-gray-400 font-mono">Use Left Sidebar Form to Add</span>
                                </div>
                                <div className="space-y-3 pl-1 text-gray-600 font-sans font-normal" id={`module-topics-list-${mod.id}`}>
                                  {mod.topics && mod.topics.length > 0 ? (
                                    mod.topics.map((tp, tpIdx) => (
                                      <div key={tp.id} className="p-3 bg-gray-50/50 border border-gray-150 rounded-xl flex flex-col gap-2.5 relative group/topic hover:bg-white hover:border-gray-300 hover:shadow-sm transition-all" id={`topic-item-${tp.id}`}>
                                        <div className="flex items-start justify-between gap-3">
                                          <div className="flex-1 min-w-0 text-left">
                                            <div className="flex flex-wrap items-center gap-2">
                                              <span className="font-sans font-extrabold text-navy-950 text-xs">
                                                {tpIdx + 1}. {tp.title}
                                              </span>
                                              {tp.referenceVideoUrl && (
                                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-mono text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                                                  Video Added
                                                </span>
                                              )}
                                              {tp.documents && tp.documents.length > 0 && (
                                                <span className="bg-blue-50 text-blue-700 border border-blue-100 font-mono text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                                                  Handouts
                                                </span>
                                              )}
                                              {tp.tools && tp.tools.length > 0 && (
                                                <span className="bg-purple-50 text-purple-700 border border-purple-100 font-mono text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase tracking-wider">
                                                  Tools ({tp.tools.length})
                                                </span>
                                              )}
                                            </div>
                                            {tp.description && (
                                              <p className="text-[11px] text-gray-600 mt-1.5 font-sans leading-relaxed">{tp.description}</p>
                                            )}
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleDeleteTopic(mod.id, tp.id)}
                                            className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-gray-100 transition-colors cursor-pointer shrink-0"
                                            title="Delete Lesson Topic"
                                            id={`delete-topic-${tp.id}`}
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        {/* Topic metadata footer inside the row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2.5 border-t border-dashed border-gray-150 text-[10px] font-mono text-gray-500">
                                          <div className="space-y-0.5">
                                            <span className="font-bold text-gray-400 uppercase block text-[9px]">🛠️ Required Tools</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {tp.tools && tp.tools.length > 0 ? (
                                                tp.tools.map((t, i) => (
                                                  <span key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] text-gray-600 border border-gray-200">{t}</span>
                                                ))
                                              ) : (
                                                <span className="text-gray-400 italic">Standard Toolkit</span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="space-y-0.5">
                                            <span className="font-bold text-gray-400 uppercase block text-[9px]">📄 Handouts / PDFs</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                              {tp.documents && tp.documents.length > 0 ? (
                                                tp.documents.map((d, i) => (
                                                  <span key={i} className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-[9px] border border-blue-100 inline-flex items-center gap-1">
                                                    <FileText className="w-2.5 h-2.5 shrink-0" /> {d}
                                                  </span>
                                                ))
                                              ) : (
                                                <span className="text-gray-400 italic">None uploaded</span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="space-y-0.5">
                                            <span className="font-bold text-gray-400 uppercase block text-[9px]">👤 Proctor Video Reference</span>
                                            {tp.referenceVideoUrl ? (
                                              <span className="text-emerald-700 font-sans font-semibold inline-flex items-center gap-1 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                                <Video className="w-3 h-3 shrink-0" /> Configured Video
                                              </span>
                                            ) : (
                                              <span className="text-gray-400 italic block mt-1">None uploaded</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="text-gray-400 italic text-[11px] py-6 text-center bg-gray-50/50 border border-dashed border-gray-200 rounded-xl">
                                      No lesson topics added to this module yet. Use the "Create Lesson Topic" form on the left!
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Sub-tab content: LEVELS */}
          {activeBuilderSubTab === 'levels' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="builder-layout">
              
              {/* Left Col: Target Select */}
              <div className="lg:col-span-1 space-y-6" id="builder-left-col">
                
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-4" id="builder-curriculum-selector">
                  <h3 className="text-base font-sans font-bold text-deep-black">Select Pathway Path</h3>
                  <p className="text-xs text-gray-500">Pick a pathway level to append new training nodes.</p>
                  
                  <div className="space-y-2" id="builder-pathway-buttons">
                    {certificationPaths.map((path) => (
                      <button
                        key={path.id}
                        onClick={() => {
                          setSelectedBuilderPath(path.id);
                        }}
                        className={`w-full p-4 rounded-xl border text-left transition-all duration-150 flex items-center justify-between ${
                          selectedBuilderPath === path.id 
                            ? 'border-crimson-600 bg-white ring-2 ring-crimson-100 shadow-sm font-semibold text-deep-black' 
                            : 'border-gray-200 bg-gray-50/50 hover:bg-white text-gray-600'
                        }`}
                      >
                        <span className="flex items-center gap-3 text-xs md:text-sm">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            path.levelColor === 'Beginner' ? 'bg-gray-200 border border-gray-400' :
                            path.levelColor === 'Intermediate' ? 'bg-yellow-400' :
                            path.levelColor === 'Advanced' ? 'bg-green-500' : 'bg-black'
                          }`} />
                          {path.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Col: Add module and display list */}
              <div className="lg:col-span-2 space-y-6" id="builder-right-col">
                
                {(() => {
                  const activeBuilder = certificationPaths.find(p => p.id === selectedBuilderPath);
                  if (!activeBuilder) return null;

                  return (
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-6" id="builder-active-curriculum">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div>
                          <h3 className="text-lg font-sans font-bold text-deep-black">
                            {activeBuilder.title} Curriculum Nodes
                          </h3>
                          <p className="text-xs text-gray-400 mt-0.5">Edit syllabus nodes. These updates push instantly to active student terminals.</p>
                        </div>
                        <span className="bg-gray-100 font-mono text-xs font-bold text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                          {activeBuilder.modules.length} active syllabus segments
                        </span>
                      </div>

                      {/* Module creation form */}
                      <form onSubmit={handleAddModule} className="flex gap-3" id="add-module-form">
                        <input
                          type="text"
                          placeholder="Append a new syllabus module title..."
                          value={newModuleName}
                          onChange={(e) => setNewModuleName(e.target.value)}
                          className="bg-gray-50 border border-gray-300 rounded-lg text-xs px-4 py-3 flex-1 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                          required
                        />
                        <button
                          type="submit"
                          className="bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs px-5 py-3 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" /> Add Node
                        </button>
                      </form>

                      {/* Current modules list */}
                      <div className="space-y-3" id="builder-modules-list">
                        {activeBuilder.modules.map((module, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 border border-gray-150 rounded-xl flex items-center justify-between text-xs md:text-sm">
                            <span className="font-mono text-xs font-bold text-crimson-600 bg-crimson-50/80 px-2 py-0.5 rounded border border-crimson-100">
                              {(idx + 1).toString().padStart(2, '0')}
                            </span>
                            <span className="flex-1 font-sans font-semibold text-deep-black ml-4 pr-4">{module}</span>
                            <button
                              onClick={() => {
                                setCertificationPaths(prev => prev.map(path => {
                                  if (path.id === selectedBuilderPath) {
                                    const updatedModules = path.modules.filter((_, mIdx) => mIdx !== idx);
                                    addAuditLog(`Removed module "${module}" from ${path.title}.`, 'warning');
                                    return { ...path, modules: updatedModules };
                                  }
                                  return path;
                                }));
                              }}
                              className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-200/50 transition-colors cursor-pointer"
                              title="Remove Module"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

              </div>

            </div>
          )}

          {/* Sub-tab content: CATEGORIES */}
          {activeBuilderSubTab === 'categories' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="builder-categories-layout">
              {/* Left Column: Create new category form */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-4">
                  <div>
                    <h3 className="text-base font-sans font-bold text-deep-black">Add New Category</h3>
                    <p className="text-xs text-gray-400 mt-1">Create a new course category. It will immediately show up in the Student Learning Center and course filtering options.</p>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const input = form.elements.namedItem('categoryName') as HTMLInputElement;
                      const name = input.value.trim();
                      if (!name) return;
                      if (categories.some(c => c.toLowerCase() === name.toLowerCase())) {
                        alert("A category with this name already exists!");
                        return;
                      }
                      setCategories(prev => [...prev, name]);
                      addAuditLog(`Created new course category: "${name}"`, 'success');
                      input.value = '';
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Category Name</label>
                      <input
                        type="text"
                        name="categoryName"
                        placeholder="e.g. Cybersecurity, AI Ethics"
                        className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3.5 py-2.5 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Category
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Column: Manage existing categories */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm text-left space-y-6">
                  <div>
                    <h3 className="text-lg font-sans font-bold text-deep-black">Manage Existing Categories</h3>
                    <p className="text-xs text-gray-400 mt-0.5">Edit or delete your current directory categories. Note that deleting a category will unassign it from any pathways currently using it.</p>
                  </div>

                  <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden bg-white shadow-sm">
                    {categories.map((cat, index) => {
                      const isEditing = editingCategoryIndex === index;
                      const isDefault = ['Hardware', 'Software', 'Data Science'].includes(cat);
                      
                      return (
                        <div key={cat} className="p-4 flex items-center justify-between bg-white hover:bg-gray-50/50 transition-colors">
                          {isEditing ? (
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                const newName = editingCategoryName.trim();
                                if (!newName) return;
                                if (newName.toLowerCase() !== cat.toLowerCase() && categories.some(c => c.toLowerCase() === newName.toLowerCase())) {
                                  alert("A category with this name already exists!");
                                  return;
                                }
                                setCategories(prev => prev.map((c, i) => i === index ? newName : c));
                                addAuditLog(`Renamed category "${cat}" to "${newName}"`, 'success');
                                setEditingCategoryIndex(null);
                              }}
                              className="flex items-center gap-2 flex-1 mr-4"
                            >
                              <input
                                type="text"
                                value={editingCategoryName}
                                onChange={(e) => setEditingCategoryName(e.target.value)}
                                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg text-xs px-3 py-1.5 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                                required
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="bg-green-600 hover:bg-green-700 text-white font-sans font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingCategoryIndex(null)}
                                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-sans font-bold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </form>
                          ) : (
                            <>
                              <div className="flex items-center gap-2.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-crimson-600"></span>
                                <span className="font-sans font-semibold text-deep-black text-sm">{cat}</span>
                                {isDefault && (
                                  <span className="bg-gray-100 text-gray-500 border border-gray-200 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCategoryIndex(index);
                                    setEditingCategoryName(cat);
                                  }}
                                  className="p-1.5 rounded hover:bg-gray-100 text-gray-400 hover:text-navy-950 transition-colors cursor-pointer"
                                  title="Rename Category"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (isDefault) {
                                      if (!confirm("This is a built-in default category. Deleting it might disrupt preloaded courses. Are you sure you want to proceed?")) {
                                        return;
                                      }
                                    } else {
                                      if (!confirm(`Are you sure you want to delete the "${cat}" category?`)) {
                                        return;
                                      }
                                    }
                                    setCategories(prev => prev.filter((_, i) => i !== index));
                                    addAuditLog(`Deleted course category: "${cat}"`, 'warning');
                                  }}
                                  className="p-1.5 rounded hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                                  title="Delete Category"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* 1. COMPETENCY RUBRIC CONFIGURATOR MODAL */}
      {editingCompetency && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-lg w-full overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-navy-950 p-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[9px] font-mono font-bold text-crimson-400 uppercase tracking-widest">Syllabus Architecture</span>
                <h3 className="text-base font-sans font-extrabold tracking-tight mt-1">Configure Subheading / Task Requirements</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingCompetency(null)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-mono"
              >
                ✕
              </button>
            </div>

            {/* Form Content */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const { moduleId, competencyId, title, description, validationRequirements, tools } = editingCompetency;
                const reqsArray = validationRequirements
                  ? validationRequirements.split('\n').map(r => r.trim()).filter(Boolean)
                  : [];
                const toolsArray = tools
                  ? tools.split(',').map(t => t.trim()).filter(Boolean)
                  : [];

                setTracks(prev => prev.map(t => {
                  if (t.id === selectedTrackId) {
                    return {
                      ...t,
                      modules: t.modules.map(m => {
                        if (m.id === moduleId) {
                          return {
                            ...m,
                            competencies: m.competencies.map(c => {
                              if (c.id === competencyId) {
                                return {
                                  ...c,
                                  title: title.trim(),
                                  description: description.trim(),
                                  validationRequirements: reqsArray,
                                  tools: toolsArray
                                };
                              }
                              return c;
                            })
                          };
                        }
                        return m;
                      })
                    };
                  }
                  return t;
                }));

                addAuditLog(`Sarah Chen (Admin) configured verification rubric for task subheading: "${title || description}"`, 'success');
                alert("Successfully saved task validation requirements and tools list!");
                setEditingCompetency(null);
              }}
              className="p-6 space-y-4 overflow-y-auto flex-1 text-left"
            >
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Subheading / Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GPIO Alternate Register Setup"
                  value={editingCompetency.title}
                  onChange={(e) => setEditingCompetency(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3.5 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-semibold"
                />
                <span className="text-[10px] text-gray-400 block">Provide a clear, brief subheading or task name.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Subheading Subtext / Content Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed content and description explaining exactly what you are talking about under this subheading..."
                  value={editingCompetency.description}
                  onChange={(e) => setEditingCompetency(prev => prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3.5 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                />
                <span className="text-[10px] text-gray-400 block">Keep the text focused on the objective.</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Validation Requirements / Rubric</label>
                  <span className="text-[9px] font-mono font-bold text-crimson-600">ONE CRITERION PER LINE</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="e.g. Pin set up in Alternate Function mode (AF01)&#10;Verify wave signal form using visual analyzer&#10;Confirm code uses volatile keyword on status registers"
                  value={editingCompetency.validationRequirements}
                  onChange={(e) => setEditingCompetency(prev => prev ? { ...prev, validationRequirements: e.target.value } : null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3.5 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-semibold leading-relaxed"
                />
                <span className="text-[10px] text-gray-400 block">List exact, objective actions the student must fulfill. Fulfillments render as interactive progress check-lists.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider block">Target Instruments & Tools (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. ST-Link V2 Debugger, Logic Analyzer, ARM GCC Compiler"
                  value={editingCompetency.tools}
                  onChange={(e) => setEditingCompetency(prev => prev ? { ...prev, tools: e.target.value } : null)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-lg text-xs px-3.5 py-2 focus:outline-none focus:border-crimson-500 focus:bg-white font-sans font-medium"
                />
                <span className="text-[10px] text-gray-400 block">Separate multiple software/hardware items with a comma.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCompetency(null)}
                  className="flex-1 bg-gray-150 hover:bg-gray-200 text-gray-700 font-sans font-bold text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold text-xs py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  Save Rubric Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. PRE-FLIGHT PUBLICATION REVIEW PANEL */}
      {reviewingPublishTrack && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-3xl w-full overflow-hidden text-left flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-navy-950 p-6 text-white border-b border-navy-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-crimson-400 bg-crimson-950/40 border border-crimson-800 px-2.5 py-1 rounded uppercase tracking-widest">
                    Pre-Flight Publication Review System
                  </span>
                  <h3 className="text-xl font-sans font-extrabold tracking-tight mt-2 flex items-center gap-2">
                    <span>{reviewingPublishTrack.icon}</span>
                    <span>Verify Certification Pathway: {reviewingPublishTrack.title}</span>
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReviewingPublishTrack(null)}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-lg font-mono"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 font-sans font-medium">
                Please examine the structural layout, requirements, and verification standards below thoroughly. Once approved, the program is instantly unlocked and live for all registered candidates.
              </p>
            </div>

            {/* Scrollable Curriculum Review Feed */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 bg-gray-50/50 text-left">
              {/* Executive Details */}
              <div className="bg-white rounded-xl border border-gray-150 p-4 space-y-3 shadow-sm">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">1. High-Level Program Metadata</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-sans">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Category</span>
                    <strong className="text-navy-950 mt-0.5 block">{reviewingPublishTrack.category}</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Difficulty</span>
                    <strong className="text-navy-950 mt-0.5 block">{reviewingPublishTrack.difficulty} Level</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Duration</span>
                    <strong className="text-navy-950 mt-0.5 block">{reviewingPublishTrack.durationWeeks} Weeks</strong>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Total Modules</span>
                    <strong className="text-navy-950 mt-0.5 block">{reviewingPublishTrack.modules.length} syllabus nodes</strong>
                  </div>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <span className="text-gray-400 block text-[10px] uppercase font-mono font-bold">Program Synopsis Description</span>
                  <p className="text-xs text-gray-600 font-sans mt-1 leading-relaxed">{reviewingPublishTrack.description}</p>
                </div>
              </div>

              {/* Modules breakdown */}
              <div className="space-y-4">
                <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">2. Full Syllabus Node Outline ({reviewingPublishTrack.modules.length} Modules)</h4>
                {reviewingPublishTrack.modules.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-xl p-6 text-center italic text-xs text-gray-400">
                    Warning: There are no modules in this certification program yet. Drafts cannot be published with an empty modules catalog.
                  </div>
                ) : (
                  reviewingPublishTrack.modules.map((mod, mIdx) => (
                    <div key={mod.id} className="bg-white border border-gray-150 rounded-xl p-5 space-y-4 shadow-sm text-left">
                      <div className="border-b border-gray-100 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="bg-crimson-50 text-crimson-700 border border-crimson-100 font-mono text-[9px] font-extrabold px-2 py-0.5 rounded uppercase">
                            Module {(mIdx + 1).toString().padStart(2, '0')}
                          </span>
                          <h5 className="font-sans font-extrabold text-navy-950 text-sm mt-1">{mod.title}</h5>
                        </div>
                        <div className="flex flex-wrap gap-1.5 self-start sm:self-center text-[9px] font-mono uppercase tracking-wider">
                          <span className="px-2 py-0.5 rounded border font-bold bg-indigo-50 text-indigo-700 border-indigo-200">
                            Subtopic Syllabus
                          </span>
                          <span className={`px-2 py-0.5 rounded border font-bold ${
                            mod.quizEnabled !== false 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}>
                            {mod.quizEnabled !== false ? 'Quiz Enabled' : 'No Quiz'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600 font-sans leading-relaxed">{mod.description || 'No custom description provided.'}</p>

                      <div className="space-y-2 text-left">
                        <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Instructional Lessons ({mod.topics?.length || 0}):</span>
                        {(!mod.topics || mod.topics.length === 0) ? (
                          <p className="text-xs text-amber-600 italic font-sans">Warning: No lesson topics added to this structural module.</p>
                        ) : (
                          <div className="pl-3 border-l-2 border-gray-100 space-y-2">
                            {mod.topics.map((top, tIdx) => (
                              <div key={top.id} className="text-xs font-sans">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-navy-950">Topic {mIdx+1}.{tIdx+1}: {top.title}</span>
                                  <span className="text-gray-400 text-[10px] font-mono">({top.duration})</span>
                                </div>
                                <p className="text-gray-500 mt-0.5 leading-relaxed">{top.description}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="bg-white p-5 border-t border-gray-200 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setReviewingPublishTrack(null)}
                className="bg-gray-150 hover:bg-gray-200 text-gray-700 font-sans font-extrabold text-xs px-5 py-3 rounded-lg cursor-pointer transition-colors"
              >
                Return to Syllabus Editor
              </button>
              
              <button
                type="button"
                disabled={reviewingPublishTrack.modules.length === 0}
                onClick={() => {
                  setTracks(prev => prev.map(t => {
                    if (t.id === reviewingPublishTrack.id) {
                      return { ...t, status: 'published' };
                    }
                    return t;
                  }));
                  addAuditLog(`Sarah Chen (Admin) successfully verified and published certification: "${reviewingPublishTrack.title}"`, 'success');
                  alert(`🎉 Congratulations! The Certification Pathway "${reviewingPublishTrack.title}" has been verified, finalized, and is now LIVE on all Student terminals.`);
                  setReviewingPublishTrack(null);
                }}
                className={`font-sans font-extrabold text-xs px-6 py-3 rounded-lg cursor-pointer shadow-md transition-all flex items-center gap-1.5 ${
                  reviewingPublishTrack.modules.length === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-crimson-600 hover:bg-crimson-700 text-white hover:scale-[1.02]'
                }`}
              >
                <span>🚀</span>
                <span>Approve & Launch Certification Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
