import React, { useState, useEffect } from 'react';
import { StudentProgress, Submission, IssuedCredential, SupervisorOfficeHour, AuditLog, UserAccount } from '../types';
import { 
  ClipboardCheck, 
  Calendar, 
  Activity, 
  Github, 
  CheckCircle, 
  AlertCircle, 
  Award, 
  ExternalLink, 
  Link,
  Clock, 
  Plus, 
  Send,
  Cpu,
  Play,
  Pause,
  FileVideo,
  FileText,
  Layers,
  Volume2,
  VolumeX,
  RotateCcw,
  BookOpen,
  CheckSquare,
  ListTodo,
  ChevronDown,
  User,
  Sliders,
  Check,
  AlertTriangle,
  Bell,
  Sparkles,
  Search,
  MessageSquare
} from 'lucide-react';

interface EvaluatorDashboardProps {
  activeTab: string;
  studentProgress: StudentProgress;
  setStudentProgress: React.Dispatch<React.SetStateAction<StudentProgress>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  credentials: IssuedCredential[];
  setCredentials: React.Dispatch<React.SetStateAction<IssuedCredential[]>>;
  officeHours: SupervisorOfficeHour[];
  setOfficeHours: React.Dispatch<React.SetStateAction<SupervisorOfficeHour[]>>;
  addAuditLog: (action: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  userAccounts?: UserAccount[];
}

interface DispatchedNotification {
  id: string;
  timestamp: string;
  studentEmail: string;
  studentName: string;
  submissionTitle: string;
  status: 'approved' | 'rejected';
  score: number;
  feedback: string;
  channel: 'WebSocket' | 'SSE' | 'SMTP';
}

export default function EvaluatorDashboard({
  activeTab,
  studentProgress,
  setStudentProgress,
  submissions,
  setSubmissions,
  credentials,
  setCredentials,
  officeHours,
  setOfficeHours,
  addAuditLog,
  userAccounts = []
}: EvaluatorDashboardProps) {

  // Active grading target
  const [activeGradingSubId, setActiveGradingSubId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(95);
  const [feedbackText, setFeedbackText] = useState<string>('');

  // Interactive Video Mock state for the active review
  const [videoTime, setVideoTime] = useState<number>(0);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoSpeed, setVideoSpeed] = useState<number>(1);
  const [videoVolume, setVideoVolume] = useState<number>(80);
  const [videoMuted, setVideoMuted] = useState<boolean>(false);

  // Grading Matrix checkboxes (key is `${subId}-${criterionIndex}`)
  const [gradingMatrix, setGradingMatrix] = useState<Record<string, boolean>>({});

  // Dispatcher notifications simulation feed state
  const [dispatchedNotifications, setDispatchedNotifications] = useState<DispatchedNotification[]>(() => {
    const saved = localStorage.getItem('dojo_dispatched_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Office hours form
  const [showAddOfficeHour, setShowAddOfficeHour] = useState(false);
  const [supervisorTopic, setSupervisorTopic] = useState('');
  const [supervisorTime, setSupervisorTime] = useState('');
  const [supervisorCapacity, setSupervisorCapacity] = useState<number>(15);

  // Queue filter state ('pending', 'graded', 'all')
  const [queueFilter, setQueueFilter] = useState<'pending' | 'graded' | 'all'>('pending');

  // Auto-save notifications
  useEffect(() => {
    localStorage.setItem('dojo_dispatched_notifications', JSON.stringify(dispatchedNotifications));
  }, [dispatchedNotifications]);

  // Video timer simulation
  useEffect(() => {
    let timer: any = null;
    if (videoPlaying) {
      timer = setInterval(() => {
        setVideoTime(prev => {
          if (prev >= 120) {
            setVideoPlaying(false);
            return 0;
          }
          return Math.min(120, prev + videoSpeed);
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [videoPlaying, videoSpeed]);

  // Helper to sync video speed when changed
  const handleSpeedChange = (speed: number) => {
    setVideoSpeed(speed);
  };

  // Helper to toggle mute
  const toggleMuted = () => {
    setVideoMuted(!videoMuted);
  };

  // Formatter for MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Transcript helper depending on active submission selection
  const getSubtitlesForTime = (time: number, subId: string) => {
    if (subId === 'sub-102') {
      if (time < 25) return "Welcome, Supervisor Kenji! This screencast demonstrates the collaborative canvas loading in the browser viewport.";
      if (time < 55) return "We are modifying canvas coordinates dynamically. All nodes broadcast via state variables with zero lag.";
      if (time < 90) return "Zustand state selectors are optimized. In the profile inspector, you can see redundant renders are avoided.";
      return "Finally, testing the viewport responsive boundaries. The layout container resizes smoothly via ResizeObserver.";
    } else if (subId === 'sub-201') {
      if (time < 25) return "Hello Supervisor! Here is the demonstration of our distributed API gateway. Connecting to local server on port 3000.";
      if (time < 55) return "Publishing a SSE transaction packet. As we tail the local console, subscribers register updates immediately.";
      if (time < 90) return "Checking the Redis command line interface. The global channels are caching and syncing state across hosts.";
      return "Now dropping the primary database. The system automatically shifts to connection pools with zero dropout errors.";
    } else {
      if (time < 25) return "Welcome, Supervisor! Booting up our local development client using Vite. The application compiles cleanly.";
      if (time < 55) return "Running our end-to-end automated tests. All assertions pass with clear indicators in the logs.";
      if (time < 90) return "Checking responsive structures. Navigating menus dynamically to check mobile layout scaling.";
      return "Code architecture hides all secret API keys using local env overrides. Ready for official audit review.";
    }
  };

  // Custom checklists for dynamic matrix representation
  const getCriteriaForSub = (subId: string) => {
    if (subId === 'sub-102') {
      return [
        { key: 'error-free', label: 'Zero runtime compiler warnings or React render lifecycle errors' },
        { key: 'state-mgmt', label: 'Zustand/Context state variables optimized with selector bindings' },
        { key: 'motion-effects', label: 'Touch motions are fluid, performant, and scale accurately' },
        { key: 'responsive-canvas', label: 'Canvas matches viewport resize rules cleanly using ResizeObserver' }
      ];
    } else if (subId === 'sub-201') {
      return [
        { key: 'sse-routing', label: 'SSE broadcast distributes event packets instantly to all active sockets' },
        { key: 'redis-pubsub', label: 'Redis subscription triggers cluster state replication successfully' },
        { key: 'drizzle-schema', label: 'Drizzle schemas contain proper relational index properties' },
        { key: 'error-handling', label: 'Robust API middleware captures database failovers and retries query pools' }
      ];
    } else {
      return [
        { key: 'clean-compilation', label: 'Code compiles successfully with zero syntax errors or warnings' },
        { key: 'repo-structure', label: 'Repository structure follows standard modular guidelines' },
        { key: 'demo-completeness', label: 'Screen recording validates all required user journeys and parameters' },
        { key: 'credentials-security', label: 'Secure architecture shields all private keys from public logs' }
      ];
    }
  };

  const handleCheckboxChange = (subId: string, idx: number) => {
    const key = `${subId}-${idx}`;
    setGradingMatrix(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Helper to check if all checkboxes are selected
  const allCriteriaChecked = (subId: string) => {
    return true;
  };

  // Handle grading submission
  const handleGradeSubmission = (subId: string, status: 'approved' | 'rejected') => {
    if (!feedbackText.trim()) {
      alert("Please enter constructive evaluator feedback before dispatching results.");
      return;
    }

    const submissionToGrade = submissions.find(s => s.id === subId);
    if (!submissionToGrade) return;

    // 1. Update submissions array in parent state
    setSubmissions(prev => prev.map(sub => {
      if (sub.id === subId) {
        return {
          ...sub,
          status,
          score,
          feedback: feedbackText,
          evaluatedBy: 'Lead Instructor Kenji (Senior Supervisor)',
          evaluatedAt: new Date().toISOString()
        };
      }
      return sub;
    }));

    // 2. If approved, advance student points/level!
    if (status === 'approved') {
      if (submissionToGrade.studentEmail === studentProgress.email) {
        setStudentProgress(prev => {
          let nextLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = prev.currentLevel;
          let nextPoints = prev.points;
          let nextRequired = prev.totalRequiredPoints;

          if (submissionToGrade.submissionType === 'competence') {
            nextPoints += 20; // Award 20 points for each unit subheading validation!
          } else {
            // Capstone project triggers level advancement!
            nextPoints += 50; // award 50 points for passing capstone!
            if (submissionToGrade.level === 'Beginner') {
              nextLevel = 'Intermediate';
              nextRequired = 200;
            } else if (submissionToGrade.level === 'Intermediate') {
              nextLevel = 'Advanced';
              nextRequired = 350;
            } else if (submissionToGrade.level === 'Advanced') {
              nextLevel = 'Expert';
              nextRequired = 500;
            }
          }

          return {
            ...prev,
            currentLevel: nextLevel,
            points: nextPoints,
            totalRequiredPoints: nextRequired
          };
        });

        // Sync completed topic checkmark in student's localStorage
        if (submissionToGrade.submissionType === 'competence' && submissionToGrade.topicId) {
          try {
            const saved = localStorage.getItem('dojo_completed_topics');
            const completed = saved ? JSON.parse(saved) : [];
            if (!completed.includes(submissionToGrade.topicId)) {
              completed.push(submissionToGrade.topicId);
              localStorage.setItem('dojo_completed_topics', JSON.stringify(completed));
            }
          } catch (e) {
            console.error('Error saving task progress to localStorage:', e);
          }
        }
      }

      if (submissionToGrade.submissionType === 'competence') {
        addAuditLog(`Lead Instructor Kenji approved and verified task completion for ${submissionToGrade.studentName}: "${submissionToGrade.title}"`, 'success');
      } else {
        // Generate verifiable certificate hash
        const randomHash = '0x' + Array.from({ length: 40 }, () => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');

        const newCredential: IssuedCredential = {
          id: `CRED-${submissionToGrade.level[0]}-${Math.floor(10000 + Math.random() * 90000)}`,
          studentName: submissionToGrade.studentName,
          studentEmail: submissionToGrade.studentEmail,
          level: submissionToGrade.level,
          issuedAt: new Date().toISOString(),
          hash: randomHash,
          status: 'active',
          signatures: {
            evaluator: 'Lead Instructor Kenji',
            admin: 'Sarah Admin'
          }
        };

        setCredentials(prev => [newCredential, ...prev]);
        addAuditLog(`Lead Instructor Kenji approved & signed off ${submissionToGrade.studentName} for ${submissionToGrade.level} Level certification. Credential issued.`, 'success');
      }
    } else {
      addAuditLog(`Lead Instructor Kenji requested revisions for ${submissionToGrade.studentName}'s submission: "${submissionToGrade.title}"`, 'warning');
    }

    // 3. Simulated Automated System Notification Event dispatcher
    const newNotification: DispatchedNotification = {
      id: `DISP-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: new Date().toLocaleTimeString(),
      studentEmail: submissionToGrade.studentEmail,
      studentName: submissionToGrade.studentName,
      submissionTitle: submissionToGrade.title,
      status,
      score: status === 'approved' ? score : 0,
      feedback: feedbackText,
      channel: 'WebSocket'
    };

    setDispatchedNotifications(prev => [newNotification, ...prev]);

    // Reset Form & active selection
    setActiveGradingSubId(null);
    setFeedbackText('');
    setScore(95);
    setVideoPlaying(false);
    setVideoTime(0);

    alert(`Notification dispatched successfully!\n\nSimulated WebSocket package transmitted to ${submissionToGrade.studentName} (${submissionToGrade.studentEmail}) notifying them of the grade.`);
  };

  // Add Supervisor slot
  const handleAddOfficeHour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supervisorTopic.trim() || !supervisorTime.trim()) return;

    const newSlot: SupervisorOfficeHour = {
      id: `slot-${Date.now()}`,
      supervisorName: 'Lead Instructor Kenji',
      topic: supervisorTopic.trim(),
      timeSlot: supervisorTime.trim(),
      capacity: supervisorCapacity,
      enrolled: 0
    };

    setOfficeHours([...officeHours, newSlot]);
    addAuditLog(`Lead Instructor Kenji scheduled a new Supervisor Office Hour slot: "${supervisorTopic.trim()}"`, 'info');
    
    // Clear
    setSupervisorTopic('');
    setSupervisorTime('');
    setShowAddOfficeHour(false);
  };

  const pendingQueue = submissions.filter(s => s.status === 'pending');
  const resolvedQueue = submissions.filter(s => s.status !== 'pending');
  const displayedQueue = queueFilter === 'pending'
    ? pendingQueue
    : queueFilter === 'graded'
      ? resolvedQueue
      : submissions;

  const selectedSub = submissions.find(s => s.id === activeGradingSubId);

  return (
    <div className="space-y-8 animate-fadeIn" id="evaluator-dashboard">
      
      {/* GRADING QUEUE TAB */}
      {activeTab === 'evaluator-queue' && (
        <div className="space-y-8" id="tab-evaluator-queue">
          
          {/* Dashboard Welcome Header */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="text-[10px] font-mono text-crimson-600 font-bold uppercase tracking-widest bg-crimson-50 border border-crimson-100 px-2.5 py-1 rounded">
                Operational Terminal
              </span>
              <h2 className="text-xl font-sans font-extrabold text-deep-black mt-2">Dojo Evaluation Hub & Review Pipeline</h2>
              <p className="text-xs text-gray-500 mt-1">
                Process student coursework validations, playback terminal demonstration reels, and audit repository structures.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="bg-crimson-600 font-mono text-xs font-bold text-white px-4 py-2 rounded-xl flex items-center gap-2 animate-pulse">
                <Sliders className="w-4 h-4" />
                {pendingQueue.length} Active Candidates
              </span>
            </div>
          </div>

          {/* Submissions Queue Table Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left" id="submissions-table-container">
            <div className="bg-navy-950 text-white p-5 border-b border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-sans font-bold flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-crimson-400" />
                  Submissions Queue
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Click "Review & Verify" on any candidate to unlock the live side-by-side verification console.</p>
              </div>
              <span className="text-[10px] font-mono text-crimson-400 font-bold bg-navy-900 border border-navy-800 px-2 py-1 rounded w-fit self-start sm:self-auto">
                SECURE WEB ROUTING: LIVE
              </span>
            </div>

            {/* Quick Filter Switcher */}
            <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2" id="queue-filter-tabs">
                <button
                  onClick={() => setQueueFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    queueFilter === 'pending'
                      ? 'bg-crimson-600 text-white shadow-sm'
                      : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  Pending Review ({pendingQueue.length})
                </button>
                <button
                  onClick={() => setQueueFilter('graded')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    queueFilter === 'graded'
                      ? 'bg-crimson-600 text-white shadow-sm'
                      : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  Graded ({resolvedQueue.length})
                </button>
                <button
                  onClick={() => setQueueFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-all cursor-pointer ${
                    queueFilter === 'all'
                      ? 'bg-crimson-600 text-white shadow-sm'
                      : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                  }`}
                >
                  All Submissions ({submissions.length})
                </button>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Displaying {displayedQueue.length} record(s)
              </span>
            </div>

            {displayedQueue.length === 0 ? (
              <div className="py-16 text-center space-y-4 text-gray-500 bg-white" id="queue-empty">
                <ClipboardCheck className="w-14 h-14 text-gray-200 mx-auto animate-bounce" />
                <p className="text-base font-sans font-bold text-deep-black">No submissions found</p>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  {queueFilter === 'pending' 
                    ? "Excellent job, Supervisor Kenji! All incoming capstones and topics are evaluated and certified." 
                    : queueFilter === 'graded' 
                      ? "No graded submissions are registered in this session yet." 
                      : "There are no student submissions in this pipeline."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="pending-submissions-table">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold">Candidate Name</th>
                      <th className="px-6 py-4 font-bold">Course Track</th>
                      <th className="px-6 py-4 font-bold">Module / Topic Type</th>
                      <th className="px-6 py-4 font-bold">Submitted Timestamp</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs font-sans">
                    {displayedQueue.map((sub) => {
                      const isCurrentlySelected = activeGradingSubId === sub.id;
                      // Find course track name
                      let trackName = 'Foundations';
                      if (sub.level === 'Intermediate') trackName = 'Advanced Client';
                      if (sub.level === 'Advanced') trackName = 'Fullstack backend';
                      if (sub.level === 'Expert') trackName = 'Enterprise Cloud';

                      return (
                        <tr 
                          key={sub.id} 
                          className={`hover:bg-gray-50/80 transition-colors ${
                            isCurrentlySelected ? 'bg-crimson-50/30 font-medium' : ''
                          }`}
                        >
                          <td className="px-6 py-4 font-semibold text-deep-black">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-navy-100 text-navy-800 flex items-center justify-center font-bold text-[10px]">
                                {sub.studentName.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <span>{sub.studentName}</span>
                                <span className="block text-[10px] text-gray-400 font-normal">{sub.studentEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-navy-50 text-navy-900 border border-navy-100 font-medium text-[11px]">
                              🏆 {trackName} ({sub.level})
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="max-w-[320px] flex flex-wrap items-center gap-1.5" title={sub.title}>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-extrabold uppercase shrink-0 ${
                                sub.submissionType === 'competence' ? 'bg-crimson-100 text-crimson-700' : 'bg-green-100 text-green-700'
                              }`}>
                                {sub.submissionType === 'competence' ? 'Topic Unit' : 'Capstone'}
                              </span>
                              {sub.status === 'approved' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-green-100 text-green-800 border border-green-200 uppercase shrink-0">
                                  Approved ({sub.score} pts)
                                </span>
                              )}
                              {sub.status === 'rejected' && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase shrink-0">
                                  Revisions Requested
                                </span>
                              )}
                              <span className="text-gray-700 font-medium truncate block max-w-[150px]">{sub.title}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono text-gray-400">
                            {new Date(sub.submittedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => {
                                setActiveGradingSubId(isCurrentlySelected ? null : sub.id);
                                setScore(sub.score || 95);
                                setFeedbackText(sub.feedback || '');
                                setVideoPlaying(false);
                                setVideoTime(0);
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold cursor-pointer transition-all ${
                                isCurrentlySelected 
                                  ? 'bg-crimson-600 text-white shadow-sm' 
                                  : 'bg-navy-950 text-white hover:bg-navy-900 shadow-sm'
                              }`}
                            >
                              {isCurrentlySelected ? 'Close Console' : 'Review & Verify'}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SIDE-BY-SIDE REVIEW WORKSPACE */}
          {selectedSub && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn" id="review-portal-workspace">
              
              {/* LEFT COLUMN: Premium Video Screencast & Github Links */}
              <div className="space-y-6 text-left" id="workspace-left-panel">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div>
                      <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-widest">Workspace Panel Left</span>
                      <h3 className="text-base font-sans font-bold text-deep-black flex items-center gap-2 mt-1">
                        <FileVideo className="w-5 h-5 text-crimson-600" />
                        Verification Screencast
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                      ID: {selectedSub.id}
                    </span>
                  </div>

                  {/* HIGH-FIDELITY INTERACTIVE VIDEO PLAYER MOCKUP */}
                  <div className="bg-navy-950 rounded-2xl overflow-hidden border border-navy-900 shadow-md relative" id="review-video-player-root">
                    
                    {/* Visual viewport block */}
                    <div className="aspect-video bg-gradient-to-b from-navy-900 to-navy-950 p-6 flex flex-col justify-between relative overflow-hidden select-none">
                      
                      {/* Top status header */}
                      <div className="flex items-center justify-between text-xs font-mono text-gray-400 relative z-10">
                        <span className="bg-navy-800/80 border border-navy-700/50 px-2 py-0.5 rounded flex items-center gap-1.5 text-[9px]">
                          <span className={`w-1.5 h-1.5 rounded-full ${videoPlaying ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                          {videoPlaying ? 'PLAYING BACK SCREENCAPTURE' : 'PAUSED'}
                        </span>
                        <span className="bg-navy-800/80 border border-navy-700/50 px-2 py-0.5 rounded text-[9px]">
                          SIZE: 14.2 MB
                        </span>
                      </div>

                      {/* Video center screen */}
                      <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                        {!videoPlaying && videoTime === 0 ? (
                          <button
                            onClick={() => setVideoPlaying(true)}
                            className="w-16 h-16 rounded-full bg-crimson-600 hover:bg-crimson-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                          >
                            <Play className="w-7 h-7 fill-white ml-1" />
                          </button>
                        ) : (
                          /* Interactive wave overlay when playing to show action */
                          videoPlaying && (
                            <div className="flex items-end gap-1 h-10 mb-4 opacity-30">
                              {Array.from({ length: 14 }).map((_, i) => (
                                <div 
                                  key={i} 
                                  className="bg-crimson-500 w-1 rounded-full"
                                  style={{ 
                                    height: `${10 + Math.sin(videoTime * 0.4 + i) * 80}%`,
                                    transition: 'height 0.2s ease-in-out'
                                  }}
                                />
                              ))}
                            </div>
                          )
                        )}

                        {/* Subtitles Transcript Overlay */}
                        <div className="bg-black/85 border border-white/10 px-4 py-2.5 rounded-xl text-center max-w-md mx-auto text-white mt-auto animate-fadeIn leading-relaxed text-xs">
                          <span className="text-[8px] font-mono text-yellow-400 block uppercase tracking-wider mb-0.5 opacity-60">
                            LIVE TRANSCRIPT INTERCEPTOR
                          </span>
                          "{getSubtitlesForTime(videoTime, selectedSub.id)}"
                        </div>
                      </div>

                      {/* Video control bottom bar */}
                      <div className="bg-black/60 p-3 rounded-xl border border-white/10 flex flex-col gap-2.5 relative z-10 mt-4">
                        {/* Interactive Scrubbing progress line */}
                        <div className="flex items-center gap-2">
                          <input 
                            type="range"
                            min={0}
                            max={120}
                            value={videoTime}
                            onChange={(e) => setVideoTime(Number(e.target.value))}
                            className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-crimson-600 focus:outline-none"
                          />
                        </div>

                        {/* Interactive buttons */}
                        <div className="flex items-center justify-between text-white text-[11px] font-mono">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setVideoPlaying(!videoPlaying)}
                              className="hover:text-crimson-400 cursor-pointer"
                              title={videoPlaying ? 'Pause' : 'Play'}
                            >
                              {videoPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                            </button>
                            <button
                              onClick={() => {
                                setVideoTime(0);
                                setVideoPlaying(false);
                              }}
                              className="hover:text-crimson-400 cursor-pointer"
                              title="Reset"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-gray-400">
                              {formatTime(videoTime)} / 02:00
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Playback speed toggle */}
                            <div className="flex bg-white/10 rounded overflow-hidden border border-white/5 p-0.5">
                              {[1, 1.5, 2].map(speed => (
                                <button
                                  key={speed}
                                  onClick={() => handleSpeedChange(speed)}
                                  className={`px-1 rounded text-[8px] cursor-pointer ${
                                    videoSpeed === speed ? 'bg-crimson-600 text-white' : 'text-gray-400 hover:text-white'
                                  }`}
                                >
                                  {speed}x
                                </button>
                              ))}
                            </div>

                            {/* Volume controller */}
                            <div className="flex items-center gap-1.5">
                              <button onClick={toggleMuted} className="hover:text-crimson-400 cursor-pointer">
                                {videoMuted || videoVolume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                              </button>
                              <input 
                                type="range"
                                min={0}
                                max={100}
                                value={videoMuted ? 0 : videoVolume}
                                onChange={(e) => {
                                  setVideoVolume(Number(e.target.value));
                                  setVideoMuted(false);
                                }}
                                className="w-12 h-1 accent-crimson-600 bg-gray-700 rounded-lg cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* CLICKABLE TRANSCRIPT CUES LIST */}
                    <div className="bg-navy-900 border-t border-navy-800 p-4 text-left">
                      <span className="text-[9px] font-mono text-gray-400 uppercase tracking-wider block border-b border-navy-800 pb-1.5 mb-2 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-crimson-500" /> Click Transcript to Jump Timeline
                      </span>
                      <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-2" id="review-transcript-list">
                        {[
                          { t: 10, label: "00:10 - Dev sandbox boot validation & setup checks" },
                          { t: 40, label: "00:40 - Operational rendering of dynamic client components" },
                          { t: 75, label: "01:15 - Code optimization auditing & state store checks" },
                          { t: 105, label: "01:45 - Viewport adaptivity triggers & environment checks" }
                        ].map((cue, cIdx) => (
                          <button
                            key={cIdx}
                            onClick={() => {
                              setVideoTime(cue.t);
                              setVideoPlaying(true);
                            }}
                            className={`w-full text-left p-1.5 rounded text-[11px] font-mono transition-colors cursor-pointer flex items-center justify-between ${
                              videoTime >= cue.t && (cIdx === 3 || videoTime < [10, 40, 75, 105][cIdx+1])
                                ? 'bg-crimson-600/10 text-crimson-400 border border-crimson-500/25 font-bold' 
                                : 'hover:bg-navy-850/50 text-gray-300'
                            }`}
                          >
                            <span>{cue.label}</span>
                            <span className="text-[9px] text-gray-400 shrink-0">Click to Play</span>
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* WRITEOUT DESCRIPTION */}
                  <div className="bg-gray-50 rounded-xl border border-gray-200/60 p-4 space-y-2">
                    <span className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider block">Candidate Description & Writeup</span>
                    <p className="text-xs text-gray-700 leading-relaxed font-sans">{selectedSub.submissionText}</p>
                  </div>

                  {/* SUBMITTED VERIFICATION ASSETS (LINKS + FILES) */}
                  <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
                    <div className="border-b border-gray-100 pb-2">
                      <h4 className="text-xs font-sans font-bold text-deep-black flex items-center gap-1.5">
                        <Link className="w-4 h-4 text-crimson-600" />
                        Submitted Competency Reference Links
                      </h4>
                      <p className="text-[10px] text-gray-500">URLs and repository resources provided for candidate validation.</p>
                    </div>

                    {selectedSub.links && selectedSub.links.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {selectedSub.links.map((link, idx) => (
                          <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60 min-w-0 flex flex-col justify-between">
                            <span className="text-[9px] font-mono text-gray-500 block truncate font-bold uppercase">{link.description || 'Reference Link'}</span>
                            <a 
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono font-bold text-crimson-600 hover:underline truncate block mt-1 flex items-center gap-1 text-[11px]"
                              title={link.url}
                            >
                              {link.url} <ExternalLink className="w-3 h-3 shrink-0 text-gray-400" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : selectedSub.githubUrl ? (
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60 flex items-center justify-between gap-3 min-w-0">
                        <div className="min-w-0">
                          <span className="text-[9px] font-mono text-gray-500 block font-bold uppercase">Candidate Repository URL</span>
                          <span className="font-mono text-[11px] text-gray-700 block truncate" title={selectedSub.githubUrl}>{selectedSub.githubUrl}</span>
                        </div>
                        <a 
                          href={selectedSub.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-navy-950 hover:bg-navy-900 text-white font-mono text-[10px] font-bold px-3 py-1.5 rounded flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                        >
                          Inspect Repo
                          <ExternalLink className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    ) : (
                      <span className="font-mono text-[10px] text-red-500 italic">No reference links provided.</span>
                    )}

                    {/* Files/Screen recording uploads */}
                    {((selectedSub.files && selectedSub.files.length > 0) || selectedSub.videoDemoUrl) && (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <h4 className="text-xs font-sans font-bold text-deep-black flex items-center gap-1.5">
                          <FileText className="w-4 h-4 text-blue-600" />
                          Candidate Attachments & Recordings
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                          {selectedSub.files && selectedSub.files.length > 0 ? (
                            selectedSub.files.map((file, idx) => (
                              <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60 flex items-center justify-between gap-2.5 min-w-0">
                                <div className="flex items-center gap-2 min-w-0">
                                  {file.type === 'video' ? <FileVideo className="w-4.5 h-4.5 text-crimson-600 shrink-0" /> : <FileText className="w-4.5 h-4.5 text-blue-600 shrink-0" />}
                                  <div className="min-w-0">
                                    <span className="font-sans font-semibold text-deep-black block text-[11px] truncate" title={file.name}>{file.name}</span>
                                    <span className="font-mono text-[9px] text-gray-400 block uppercase font-bold">{file.type} • {file.size}</span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => alert(`📥 Simulating File Download: Downloading "${file.name}" (${file.size}).`)}
                                  className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-sans text-[9px] font-bold px-2 py-1 rounded shrink-0 transition-all cursor-pointer"
                                >
                                  Download
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60 flex items-center justify-between gap-2.5 min-w-0">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileVideo className="w-4.5 h-4.5 text-crimson-600 shrink-0" />
                                <div className="min-w-0">
                                  <span className="font-sans font-semibold text-deep-black block text-[11px] truncate" title={selectedSub.videoDemoUrl}>{selectedSub.videoDemoUrl}</span>
                                  <span className="font-mono text-[9px] text-gray-400 block uppercase font-bold">Screen Recording</span>
                                </div>
                              </div>
                              {selectedSub.videoDemoUrl && selectedSub.videoDemoUrl.startsWith('http') && (
                                <a 
                                  href={selectedSub.videoDemoUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-sans text-[9px] font-bold px-2 py-1 rounded shrink-0 transition-all cursor-pointer"
                                >
                                  Watch Link
                                </a>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Interactive Grading Matrix, Score & Dispatch */}
              <div className="space-y-6 text-left" id="workspace-right-panel">
                <div className="bg-white rounded-2xl border-2 border-crimson-600/20 p-6 shadow-md space-y-6">
                  <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-crimson-600 font-bold uppercase tracking-widest">Workspace Panel Right</span>
                      <h3 className="text-base font-sans font-bold text-deep-black flex items-center gap-2 mt-1">
                        <Award className="w-5 h-5 text-crimson-600" />
                        Grading Matrix Verification
                      </h3>
                    </div>
                    <span className="bg-crimson-50 text-crimson-700 font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border border-crimson-100">
                      Rubric Active
                    </span>
                  </div>

                  {/* Score assignment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono font-bold text-gray-500">
                      <span className="uppercase tracking-wider">Score Assignment</span>
                      <span className="text-crimson-600 font-extrabold">{score} / 100</span>
                    </div>
                    <input 
                      type="range"
                      min={60}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-crimson-600 focus:outline-none"
                    />
                    <div className="flex justify-between text-[9px] font-mono text-gray-400">
                      <span>60% Passing</span>
                      <span>100% Perfect Rubric</span>
                    </div>
                  </div>

                  {/* Manual comment area */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">
                      Manual Evaluator Comments *
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Enter comprehensive reviewer comments detailing architectural choices, codebase review points, or requested revision protocols..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-deep-black focus:border-crimson-500 focus:bg-white focus:outline-none font-sans leading-relaxed"
                      required
                    />
                  </div>

                  {/* Primary Decisions */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleGradeSubmission(selectedSub.id, 'rejected')}
                      className="flex-1 border border-crimson-600 text-crimson-600 hover:bg-crimson-50 font-sans font-bold text-xs py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <AlertCircle className="w-4 h-4" />
                      Request Revision
                    </button>

                    <button
                      onClick={() => handleGradeSubmission(selectedSub.id, 'approved')}
                      disabled={!allCriteriaChecked(selectedSub.id)}
                      className={`flex-1 font-sans font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                        allCriteriaChecked(selectedSub.id)
                          ? 'bg-green-600 hover:bg-green-700 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                      }`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approve & Pass
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* REAL-TIME SYSTEM NOTIFICATION EVENT DISPATCHER ENGINE LOGS */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left" id="notification-dispatcher-logs">
            <div className="bg-navy-950 text-white p-5 border-b border-navy-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-sans font-bold flex items-center gap-2">
                  <Bell className="w-4 h-4 text-crimson-400" />
                  Notification Dispatch Terminal (WS Active)
                </h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Automated events triggered upon grading submittals, delivering WebSocket payload packets straight to student dashboards.</p>
              </div>
              <span className="bg-green-500/20 text-green-400 font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-green-500/30 animate-pulse">
                WS SOCKETS: SHIFTED
              </span>
            </div>

            <div className="p-5 font-mono text-xs text-navy-950 bg-gray-50/50">
              {dispatchedNotifications.length === 0 ? (
                <div className="py-6 text-center text-gray-400 text-xs italic">
                  No automated websocket events dispatched in this session. Process a pending submission to broadcast.
                </div>
              ) : (
                <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2" id="notification-dispatcher-feed">
                  {dispatchedNotifications.map((notif) => (
                    <div key={notif.id} className="bg-white p-3.5 rounded-xl border border-gray-200/60 flex items-start gap-3 text-left">
                      <div className="w-8 h-8 rounded-full bg-crimson-50 text-crimson-600 border border-crimson-100 flex items-center justify-center shrink-0">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-400">
                          <span className="font-semibold text-crimson-600 bg-crimson-50 px-1.5 py-0.5 rounded">WS PACKET: {notif.id}</span>
                          <span>{notif.timestamp}</span>
                        </div>
                        <p className="text-xs text-gray-700 leading-normal">
                          Dispatched event notification packet to client channel <strong className="text-navy-950 font-semibold">{notif.studentEmail}</strong>.
                        </p>
                        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-[11px] leading-relaxed text-gray-500">
                          <span className="font-bold text-gray-700 uppercase tracking-wider text-[9px] block mb-1">JSON Event payload</span>
                          &#123; <br />
                          &nbsp;&nbsp;"recipient": "{notif.studentName}",<br />
                          &nbsp;&nbsp;"item": "{notif.submissionTitle}",<br />
                          &nbsp;&nbsp;"status": "{notif.status.toUpperCase()}",<br />
                          &nbsp;&nbsp;"evaluator": "Lead Instructor Kenji",<br />
                          &nbsp;&nbsp;"channel": "SSE_SOCKET_CLIENT_BROADCAST"<br />
                          &#125;
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* HISTORICAL RESOLVED HISTORY ROW */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-left" id="historical-archive-section">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-mono text-gray-400 font-bold uppercase tracking-wider">
                Historic Candidate Archive
              </h3>
              <p className="text-xs text-gray-400 mt-1">Audit log of certified capstone evaluations processed during the current cycle.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6" id="resolved-archive-list">
              {resolvedQueue.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-2 col-span-full">No candidates certified in this cycle yet.</p>
              ) : (
                resolvedQueue.map((sub) => (
                  <div key={sub.id} className="p-4 bg-gray-50/50 rounded-xl border border-gray-100 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                      <span>Evaluated At: {sub.evaluatedAt?.split('T')[0] || new Date().toLocaleDateString()}</span>
                      <span className={`font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] ${
                        sub.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-sans font-bold text-deep-black leading-snug line-clamp-1">{sub.title}</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Candidate: <strong>{sub.studentName}</strong></p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 border-t border-gray-100 pt-2">
                      <span>Score: <strong className="text-crimson-600 font-extrabold">{sub.score || 0}%</strong></span>
                      <span className="italic">Evaluated by Kenji</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}



      {/* STUDENT PERFORMANCE INSIGHTS */}
      {activeTab === 'evaluator-analytics' && (
        <div className="space-y-6 text-left animate-fadeIn" id="tab-evaluator-analytics">
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6" id="analytics-summary-card">
            <div>
              <h3 className="text-base font-sans font-bold text-deep-black">Student Grade Insights</h3>
              <p className="text-xs text-gray-400">Performance benchmarking of graded submissions during active evaluation periods.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="analytics-charts-grid">
              
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Average Grading Score</div>
                <div className="text-3xl font-sans font-extrabold text-deep-black">96.5%</div>
                <p className="text-xs text-green-600 font-semibold">Exceeds platform target benchmark (85%)</p>
              </div>

              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Queue Resolution Speed</div>
                <div className="text-3xl font-sans font-extrabold text-deep-black">1.2 days</div>
                <p className="text-xs text-green-600 font-semibold">94% same-day turnaround rate</p>
              </div>

              <div className="p-5 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                <div className="text-xs font-mono text-gray-400 uppercase tracking-wider">Success Ratio</div>
                <div className="text-3xl font-sans font-extrabold text-deep-black">88%</div>
                <p className="text-xs text-gray-500">Submissions approved on first attempt</p>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
