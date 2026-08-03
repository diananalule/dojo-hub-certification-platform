import React, { useState, useEffect, useRef } from 'react';
import { StudentProgress, CertificationPath, Submission, IssuedCredential, AuditLog, UserAccount } from '../types';
import { DOJO_TRACKS, Track, Module, Topic } from '../tracksData';
import { MODULE_QUIZZES, OVERALL_ASSESSMENTS, ModuleQuiz, OverallCourseAssessment } from '../assessmentQuestions';
import CertificateModal from './CertificateModal';
import { COURSES_DATA, CourseItem } from '../coursesData';
import { 
  Award, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Trophy, 
  Sparkles, 
  Send, 
  Github, 
  ExternalLink, 
  Zap,
  Info,
  ChevronRight,
  ArrowRight,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Cpu,
  Database,
  Video,
  Check,
  FileVideo,
  UploadCloud,
  Code,
  ListTodo,
  ShieldAlert,
  ChevronDown,
  VolumeX,
  Clock,
  CheckSquare,
  Search,
  Bookmark,
  Users,
  ChevronLeft,
  Edit2,
  Share2,
  FileText,
  Trash2,
  Plus,
  Link,
  ClipboardCheck,
  Home
} from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  studentProgress: StudentProgress;
  setStudentProgress: React.Dispatch<React.SetStateAction<StudentProgress>>;
  certificationPaths: CertificationPath[];
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  credentials: IssuedCredential[];
  addAuditLog: (action: string, type: 'info' | 'success' | 'warning' | 'error') => void;
  userAccounts?: UserAccount[];
  tracks: Track[];
  categories: string[];
}

  // Helper to map levels to full names
  const getFullLevelName = (level: string) => {
    switch (level) {
      case 'Beginner': return 'Beginner Level (Foundations)';
      case 'Intermediate': return 'Intermediate Level (Application)';
      case 'Advanced': return 'Advanced Level (Competence)';
      case 'Expert': return 'Expert Level (Capstone & Mastery)';
      default: return level;
    }
  };
// Practice quiz questions removed

const RECOMMENDATIONS = {
  Beginner: [
    {
      title: "Foundations of Web Semantics",
      description: "Learn HTML5 semantic structures, head metadata, responsive meta tags, and accessible markup practices.",
      duration: "1h 15m",
      trackId: "track-software",
      moduleId: "sw-mod-1",
      topicId: "sw-top-11",
      level: "Beginner",
      badge: "HTML5 & CSS3"
    },
    {
      title: "Embedded Arduino Sandbox",
      description: "Simulate electronic pins and debug serial output using virtual microcontrollers and physical sensors.",
      duration: "45m",
      trackId: "track-hardware",
      moduleId: "hw-mod-1",
      topicId: "hw-top-11",
      level: "Beginner",
      badge: "Arduino"
    },
    {
      title: "Python Data Science Foundations",
      description: "Configure Jupyter environments, learn clean numpy vectors, and practice basic statistics operations.",
      duration: "1h 30m",
      trackId: "track-data",
      moduleId: "ds-mod-1",
      topicId: "ds-top-11",
      level: "Beginner",
      badge: "Python Core"
    }
  ],
  Intermediate: [
    {
      title: "ARM Cortex-M Bare-Metal Timers",
      description: "Dive deep into hardware registers, interrupt vector tables, and GPIO configuration.",
      duration: "2h 10m",
      trackId: "track-hardware",
      moduleId: "hw-mod-1",
      topicId: "hw-top-11",
      level: "Intermediate",
      badge: "ARM C"
    },
    {
      title: "React Components State Lifecycles",
      description: "Study render batching, virtual DOM structures, and side-effects controls in simple single page applications.",
      duration: "1h 50m",
      trackId: "track-software",
      moduleId: "sw-mod-1",
      topicId: "sw-top-11",
      level: "Intermediate",
      badge: "React SPA"
    },
    {
      title: "Pandas Exploratory Data Analysis",
      description: "Clean csv and json files. Perform multi-index groupings and plot correlations with matplotlib.",
      duration: "2h 00m",
      trackId: "track-data",
      moduleId: "ds-mod-1",
      topicId: "ds-top-11",
      level: "Intermediate",
      badge: "Pandas"
    }
  ],
  Advanced: [
    {
      title: "Zustand Selectors & Fiber Reconciliation",
      description: "Optimize component renders. Prevent infinite rendering loops and profiling state slices.",
      duration: "2h 45m",
      trackId: "track-software",
      moduleId: "sw-mod-1",
      topicId: "sw-top-11",
      level: "Advanced",
      badge: "Zustand"
    },
    {
      title: "SPI Protocols & DMA Buffers",
      description: "Transfer digital bytes at maximum clock rates. Configure DMA streams to offload processor cycles.",
      duration: "3h 15m",
      trackId: "track-hardware",
      moduleId: "hw-mod-2",
      topicId: "hw-top-22",
      level: "Advanced",
      badge: "SPI / DMA"
    },
    {
      title: "Scikit-Learn PCA Dimensionality Pipelines",
      description: "Apply Principal Component Analysis onto high-dimensional vectors and project correlations.",
      duration: "1h 40m",
      trackId: "track-data",
      moduleId: "ds-mod-1",
      topicId: "ds-top-12",
      level: "Advanced",
      badge: "Scikit-Learn"
    }
  ],
  Expert: [
    {
      title: "Zero-Trust Infrastructure & JWT Authentication",
      description: "Secure Express servers. Set token signatures, rate-limiters, and secure cookie storage rules.",
      duration: "4h 00m",
      trackId: "track-software",
      moduleId: "sw-mod-2",
      topicId: "sw-top-21",
      level: "Expert",
      badge: "Security / JWT"
    },
    {
      title: "Custom Backpropagation in PyTorch",
      description: "Write PyTorch neural modules, compute gradient slopes, log training runs, and save model files.",
      duration: "3h 30m",
      trackId: "track-data",
      moduleId: "ds-mod-2",
      topicId: "ds-top-22",
      level: "Expert",
      badge: "PyTorch"
    },
    {
      title: "Horizontal Scale & Redis Eviction",
      description: "Architect distributed systems. Manage replication latency, cache TTL triggers, and load tests.",
      duration: "5h 15m",
      trackId: "track-software",
      moduleId: "sw-mod-2",
      topicId: "sw-top-22",
      level: "Expert",
      badge: "Redis Cluster"
    }
  ]
};

const CourseCard = ({ 
  course, 
  onLaunch, 
  isEnrolled
}: { 
  course: CourseItem; 
  onLaunch?: () => void; 
  isEnrolled?: boolean;
  key?: string;
}) => {
  return (
    <div 
      onClick={onLaunch}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group text-left h-full cursor-pointer" 
      id={`course-card-${course.id}`}
    >
      <div>
        {/* Course Cover Graphic with Gradient and Icon */}
        <div className={`h-36 bg-gradient-to-br ${course.gradient} relative flex items-center justify-center p-4`} id={`course-cover-${course.id}`}>
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
          <span className="text-4xl select-none group-hover:scale-110 transition-transform duration-300" id={`course-icon-span-${course.id}`}>{course.icon}</span>
          <span className="absolute bottom-3 right-3 bg-navy-950/80 backdrop-blur-sm text-[9px] font-mono text-white px-2 py-0.5 rounded border border-navy-800" id={`course-duration-${course.id}`}>
            {course.duration}
          </span>
        </div>

        {/* Course Details */}
        <div className="p-5 space-y-2" id={`course-details-${course.id}`}>
          <h4 className="text-sm font-sans font-extrabold text-navy-950 group-hover:text-crimson-600 transition-colors line-clamp-2 leading-snug" id={`course-title-header-${course.id}`}>
            {course.title}
          </h4>

          <p className="text-xs text-gray-400 font-sans" id={`course-instructor-${course.id}`}>
            By {course.instructor}
          </p>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed" id={`course-description-p-${course.id}`}>
            {course.description}
          </p>
        </div>
      </div>

      {/* Action Button */}
      <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-end" id={`course-action-bar-${course.id}`}>
        <span
          className="text-xs font-sans font-bold text-crimson-600 hover:text-crimson-700 inline-flex items-center gap-0.5"
          id={`course-view-btn-${course.id}`}
        >
          View Course ➔
        </span>
      </div>
    </div>
  );
};

export default function StudentDashboard({
  activeTab,
  setActiveTab,
  studentProgress,
  setStudentProgress,
  certificationPaths,
  submissions,
  setSubmissions,
  credentials,
  addAuditLog,
  userAccounts = [],
  tracks = DOJO_TRACKS,
  categories
}: StudentDashboardProps) {

  const DOJO_TRACKS = tracks;
  const visibleTracks = DOJO_TRACKS.filter(track => track.status !== 'draft');

  // Convert newly created published tracks into CourseItem format to show in categories tabs
  const dynamicCourses: CourseItem[] = DOJO_TRACKS
    .filter(track => track.status === 'published')
    .map(track => {
      let gradient = 'from-blue-500 to-indigo-600';
      if (track.category === 'Hardware') {
        gradient = 'from-red-500 to-rose-600';
      } else if (track.category === 'Data Science') {
        gradient = 'from-emerald-500 to-green-700';
      }
      
      return {
        id: track.id,
        title: track.title,
        category: track.category,
        level: (track.difficulty === 'Advanced' ? 'Advanced' : track.difficulty === 'Intermediate' ? 'Intermediate' : 'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert',
        description: track.description,
        instructor: 'Platform Administrator',
        rating: 4.9,
        ratingCount: 1,
        price: 'Free',
        originalPrice: 'Free',
        duration: `${track.durationWeeks || 8} Weeks`,
        tag: 'New' as const,
        icon: track.icon || '🎓',
        gradient: gradient
      };
    });

  const mergedCourses = [...dynamicCourses, ...COURSES_DATA];

  // Selected categories and view mode for course directories
  const [selectedHomeCategory, setSelectedHomeCategory] = useState<string>(categories[0] || 'Hardware');
  const [categoryViewMode, setCategoryViewMode] = useState<string | null>(null);

  useEffect(() => {
    if (categories.length > 0 && !categories.includes(selectedHomeCategory)) {
      setSelectedHomeCategory(categories[0]);
    }
  }, [categories, selectedHomeCategory]);

  // Submission Form State
  const [selectedLevelPath, setSelectedLevelPath] = useState<string>('path-intermediate');
  const [recommendationFilter, setRecommendationFilter] = useState<'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'>('Beginner');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [formMessage, setFormMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedCertForModal, setSelectedCertForModal] = useState<IssuedCredential | null>(null);

  // Real File Upload Refs and States
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // ==========================================
  // SYLLABUS TRACK & COMPETENCY STATES
  // ==========================================
  const [activeTrackId, setActiveTrackId] = useState<string>('track-software');
  const [activeModuleId, setActiveModuleId] = useState<string>('sw-mod-1');
  const [activeTopicId, setActiveTopicId] = useState<string>('sw-top-11');

  // ==========================================
  // ENROLLMENT & SUBSCRIPTION STATES
  // ==========================================
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_enrolled_course_ids_${emailKey}`);
    if (saved) return JSON.parse(saved);
    if (emailKey === 'alex.mercer@dojo.edu') {
      return ['track-software', 'track-hardware', 'sw-top-11', 'hw-top-12', 'sw-top-21', 'sw-course-1', 'hw-course-1'];
    }
    return [];
  });

  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_enrolled_course_ids_${emailKey}`, JSON.stringify(enrolledCourseIds));
    }
    localStorage.setItem('dojo_enrolled_course_ids', JSON.stringify(enrolledCourseIds));
  }, [enrolledCourseIds, studentProgress.email]);

  const [startedCourseIds, setStartedCourseIds] = useState<string[]>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_started_course_ids_${emailKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_started_course_ids_${emailKey}`, JSON.stringify(startedCourseIds));
    }
    localStorage.setItem('dojo_started_course_ids', JSON.stringify(startedCourseIds));
  }, [startedCourseIds, studentProgress.email]);

  const handleEnrollCourse = (courseId: string, courseTitle: string) => {
    setEnrolledCourseIds(prev => {
      if (prev.includes(courseId)) return prev;
      return [...prev, courseId];
    });
    addAuditLog(`Successfully enrolled in "${courseTitle}".`, 'success');
    alert(`You have been enrolled in the course: "${courseTitle}"`);
    
    // Find matching flagship track to navigate to player
    const matchingTrack = DOJO_TRACKS.find(t => t.id === courseId) || DOJO_TRACKS.find(t => t.category === (mergedCourses.find(c => c.id === courseId)?.category));
    if (matchingTrack) {
      handleTrackChange(matchingTrack.id);
    }
    setActiveTab('student-curriculum');
  };

  const handleEnrollTopic = (topicId: string, trackId: string, moduleId: string, topicTitle: string) => {
    setEnrolledCourseIds(prev => {
      const next = [...prev];
      if (!next.includes(topicId)) next.push(topicId);
      if (!next.includes(trackId)) next.push(trackId);
      return next;
    });
    addAuditLog(`Successfully enrolled in "${topicTitle}".`, 'success');
    alert(`You have been enrolled in the course: "${topicTitle}"`);
    handleSelectTopic(trackId, moduleId, topicId);
    setActiveTab('student-curriculum');
  };

  const handleUnenrollCourse = (courseId: string, courseTitle: string) => {
    setEnrolledCourseIds(prev => {
      // Remove the course/track ID and any associated topics
      return prev.filter(id => id !== courseId && !id.startsWith(courseId.replace('track-', '')));
    });
    setStartedCourseIds(prev => prev.filter(id => id !== courseId));
    addAuditLog(`Successfully unenrolled from "${courseTitle}".`, 'info');
    alert(`You have successfully unenrolled from "${courseTitle}".`);
  };

  const [activeCompetencyId, setActiveCompetencyId] = useState<string>('');
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({
    'sw-mod-1': true,
    'hw-mod-1': true,
    'ds-mod-1': true
  });

  // ==========================================
  // ASSESSMENT & QUIZ STATES
  // ==========================================
  const [assessmentActive, setAssessmentActive] = useState<boolean>(false);
  const [assessmentType, setAssessmentType] = useState<'chapter-quiz' | 'course-assessment' | null>(null);
  const [assessmentModuleId, setAssessmentModuleId] = useState<string | null>(null);
  
  // Active Assessment interactive state
  const [assessmentStep, setAssessmentStep] = useState<'intro' | 'objective' | 'subjective' | 'results'>('intro');
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [assessmentSelectedAnswers, setAssessmentSelectedAnswers] = useState<Record<number, number>>({}); // questionIndex -> selectedOptionIndex
  const [assessmentShowExplanation, setAssessmentShowExplanation] = useState<boolean>(false);
  const [assessmentAnswerChecked, setAssessmentAnswerChecked] = useState<boolean>(false);
  const [isAssessmentSubmitting, setIsAssessmentSubmitting] = useState<boolean>(false);
  
  // Subjective state
  const [subjectiveResponse, setSubjectiveResponse] = useState<string>('');
  const [gradingOption, setGradingOption] = useState<'auto' | 'manual'>('auto');
  const [subjectiveGradedState, setSubjectiveGradedState] = useState<{
    status: 'none' | 'pending' | 'graded';
    score: number | null;
    feedback: string | null;
    gradedBy: string | null;
    gradedAt: string | null;
  }>({ status: 'none', score: null, feedback: null, gradedBy: null, gradedAt: null });

  // Store completed assessment results in localStorage to keep them persisted!
  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, {
    objectiveScore: number;
    objectiveTotal: number;
    subjectiveScore: number | null;
    subjectiveFeedback: string | null;
    status: 'completed' | 'pending' | 'graded';
    completedAt: string;
  }>>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_completed_quizzes_${emailKey}`);
    return saved ? JSON.parse(saved) : {};
  });

  const [completedOverallAssessments, setCompletedOverallAssessments] = useState<Record<string, {
    objectiveScore: number;
    objectiveTotal: number;
    subjectiveScore: number | null;
    subjectiveFeedback: string | null;
    status: 'completed' | 'pending' | 'graded';
    completedAt: string;
  }>>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_completed_overall_assessments_${emailKey}`);
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_completed_quizzes_${emailKey}`, JSON.stringify(completedQuizzes));
    }
    localStorage.setItem('dojo_completed_quizzes', JSON.stringify(completedQuizzes));
  }, [completedQuizzes, studentProgress.email]);

  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_completed_overall_assessments_${emailKey}`, JSON.stringify(completedOverallAssessments));
    }
    localStorage.setItem('dojo_completed_overall_assessments', JSON.stringify(completedOverallAssessments));
  }, [completedOverallAssessments, studentProgress.email]);

  // Track & Syllabus completed/submitted registries (Persisted locally)
  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_completed_topics_${emailKey}`);
    if (saved) return JSON.parse(saved);
    if (emailKey === 'alex.mercer@dojo.edu') {
      return ['sw-top-11', 'sw-top-12', 'hw-top-11'];
    }
    return [];
  });
  const [submittedTopics, setSubmittedTopics] = useState<string[]>(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    const saved = localStorage.getItem(`dojo_submitted_topics_${emailKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_completed_topics_${emailKey}`, JSON.stringify(completedTopics));
    }
    localStorage.setItem('dojo_completed_topics', JSON.stringify(completedTopics));
  }, [completedTopics, studentProgress.email]);

  useEffect(() => {
    const emailKey = studentProgress?.email?.toLowerCase() || 'anonymous';
    if (emailKey !== 'anonymous') {
      localStorage.setItem(`dojo_submitted_topics_${emailKey}`, JSON.stringify(submittedTopics));
    }
    localStorage.setItem('dojo_submitted_topics', JSON.stringify(submittedTopics));
  }, [submittedTopics, studentProgress.email]);

  // Simulated Video Player States
  const [videoPlaying, setVideoPlaying] = useState<boolean>(false);
  const [videoTime, setVideoTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  const isCourseInProgress = (trackId: string) => {
    if (!enrolledCourseIds.includes(trackId)) return false;
    
    // Check if explicitly marked started
    if (startedCourseIds.includes(trackId)) return true;
    
    // Check if any topic in this track is completed or submitted
    const track = DOJO_TRACKS.find(t => t.id === trackId);
    if (track) {
      const hasCompletedTopic = track.modules.some(m => 
        m.topics.some(t => completedTopics.includes(t.id))
      );
      if (hasCompletedTopic) return true;
      
      const hasSubmittedTopic = track.modules.some(m => 
        m.topics.some(t => submittedTopics.includes(t.id))
      );
      if (hasSubmittedTopic) return true;
    }
    
    return false;
  };

  const enrolledTracks = visibleTracks.filter(track => isCourseInProgress(track.id));

  // Automatically mark course as started if they watch a video in an enrolled course
  useEffect(() => {
    if ((videoPlaying || videoTime > 0) && enrolledCourseIds.includes(activeTrackId)) {
      setStartedCourseIds(prev => {
        if (!prev.includes(activeTrackId)) {
          return [...prev, activeTrackId];
        }
        return prev;
      });
    }
  }, [videoPlaying, videoTime, activeTrackId, enrolledCourseIds]);

  // Competence Submission States
  const [submissionLinks, setSubmissionLinks] = useState<{ url: string; description: string }[]>([
    { url: '', description: '' }
  ]);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string; type: 'document' | 'video' }[]>([]);
  const [screenRecordingUrl, setScreenRecordingUrl] = useState<string>('');
  const [competenceText, setCompetenceText] = useState<string>('');
  const [uploadFileState, setUploadFileState] = useState<{
    uploading: boolean;
    progress: number;
    fileName: string | null;
    fileSize: string | null;
    fileType: 'document' | 'video' | null;
  }>({
    uploading: false,
    progress: 0,
    fileName: null,
    fileSize: null,
    fileType: null
  });
  const [competenceMessage, setCompetenceMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const docInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Video timer effect
  useEffect(() => {
    let interval: any = null;
    if (videoPlaying) {
      interval = setInterval(() => {
        setVideoTime((prev) => {
          // Find active topic to get maximum duration
          const currentTrack = DOJO_TRACKS.find(t => t.id === activeTrackId);
          const currentModule = currentTrack?.modules.find(m => m.id === activeModuleId);
          const currentTopic = currentModule?.topics.find(t => t.id === activeTopicId);
          
          if (!currentTopic) return prev;
          
          // Parse duration "MM:SS"
          const [m, s] = currentTopic.duration.split(':').map(Number);
          const maxSeconds = m * 60 + s;
          
          if (prev >= maxSeconds) {
            setVideoPlaying(false);
            // Mark topic as "Completed" (video fully watched)
            if (!completedTopics.includes(activeTopicId)) {
              setCompletedTopics(old => [...old, activeTopicId]);
              addAuditLog(`Fully completed viewing lecture video for: "${currentTopic.title}".`, 'success');
            }
            return 0;
          }
          return prev + playbackSpeed;
        });
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [videoPlaying, playbackSpeed, activeTrackId, activeModuleId, activeTopicId, completedTopics]);

  // Sync selected topic changes
  useEffect(() => {
    setVideoPlaying(false);
    setVideoTime(0);
    setCompetenceMessage(null);
    setSubmissionLinks([{ url: '', description: '' }]);
    setUploadedFiles([]);
    setScreenRecordingUrl('');
    setCompetenceText('');
    setUploadFileState({ uploading: false, progress: 0, fileName: null, fileSize: null });
    setAssessmentActive(false);
  }, [activeTopicId]);

  // Handle Assessment Selection
  const handleSelectQuiz = (moduleId: string) => {
    setAssessmentActive(true);
    setAssessmentType('chapter-quiz');
    setAssessmentModuleId(moduleId);
    setAssessmentStep('intro');
    setActiveQuestionIndex(0);
    setAssessmentSelectedAnswers({});
    setAssessmentShowExplanation(false);
    setAssessmentAnswerChecked(false);
    setSubjectiveResponse('');
    
    // Check if we already have a saved attempt for this module quiz
    const existing = completedQuizzes[moduleId];
    if (existing) {
      setSubjectiveResponse(existing.subjectiveFeedback ? "Reviewing saved feedback below." : "");
      setSubjectiveGradedState({
        status: existing.status === 'graded' ? 'graded' : existing.status === 'pending' ? 'pending' : 'none',
        score: existing.subjectiveScore,
        feedback: existing.subjectiveFeedback,
        gradedBy: existing.status === 'graded' ? 'Lead Evaluator Kenji' : null,
        gradedAt: existing.completedAt
      });
    } else {
      setSubjectiveGradedState({ status: 'none', score: null, feedback: null, gradedBy: null, gradedAt: null });
    }
    
    addAuditLog(`Loaded Chapter Quiz for Module: "${moduleId}".`, 'info');
  };

  const handleSelectOverallAssessment = () => {
    setAssessmentActive(true);
    setAssessmentType('course-assessment');
    setAssessmentModuleId(null);
    setAssessmentStep('intro');
    setActiveQuestionIndex(0);
    setAssessmentSelectedAnswers({});
    setAssessmentShowExplanation(false);
    setAssessmentAnswerChecked(false);
    setSubjectiveResponse('');

    const existing = completedOverallAssessments[activeTrackId];
    if (existing) {
      setSubjectiveResponse(existing.subjectiveFeedback ? "Reviewing saved feedback below." : "");
      setSubjectiveGradedState({
        status: existing.status === 'graded' ? 'graded' : existing.status === 'pending' ? 'pending' : 'none',
        score: existing.subjectiveScore,
        feedback: existing.subjectiveFeedback,
        gradedBy: existing.status === 'graded' ? 'Senior Director Hiroshi' : null,
        gradedAt: existing.completedAt
      });
    } else {
      setSubjectiveGradedState({ status: 'none', score: null, feedback: null, gradedBy: null, gradedAt: null });
    }

    addAuditLog(`Loaded Overall Course Assessment for Track: "${activeTrackId}".`, 'info');
  };

  // Sync selected track changes (Auto select first module/topic)
  const handleTrackChange = (trackId: string) => {
    const targetTrack = DOJO_TRACKS.find(t => t.id === trackId);
    if (targetTrack && targetTrack.modules.length > 0) {
      const firstMod = targetTrack.modules[0];
      setActiveTrackId(trackId);
      setActiveModuleId(firstMod.id);
      setActiveTopicId(firstMod.topics.length > 0 ? firstMod.topics[0].id : '');
      // Expand module
      setExpandedModules(prev => ({ ...prev, [firstMod.id]: true }));
    }
  };

  // Helper to deep select a topic and route to the video player
  const handleSelectTopic = (trackId: string, moduleId: string, topicId: string) => {
    setActiveTrackId(trackId);
    setActiveModuleId(moduleId);
    setActiveTopicId(topicId);
    setExpandedModules(prev => ({ ...prev, [moduleId]: true }));
    setActiveTab('student-curriculum');
    setVideoPlaying(true);
    addAuditLog(`Loaded course player for topic: "${topicId}" under track: "${trackId}".`, 'info');
  };

  // Quiz State removed

  // Handle Project Submission
  const handleProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isSuspended = userAccounts.some(u => u.email === studentProgress.email && u.status === 'suspended');
    if (isSuspended) {
      alert("⚠️ Form Submission Denied: Your candidate account is suspended by administrators.");
      return;
    }

    if (!projectTitle.trim() || !submissionText.trim()) {
      setFormMessage({ text: 'Please fill in all required fields.', isError: true });
      return;
    }

    const targetPath = certificationPaths.find(p => p.id === selectedLevelPath);
    if (!targetPath) return;

    // Check if student already has a pending submission for this level
    const existingPending = submissions.find(
      s => s.studentEmail === studentProgress.email && s.level === targetPath.levelColor && s.status === 'pending'
    );

    if (existingPending) {
      setFormMessage({ text: `You already have a pending submission for the ${targetPath.levelColor} Level in evaluation queue.`, isError: true });
      return;
    }

    const newSubmission: Submission = {
      id: `sub-${Date.now()}`,
      studentName: studentProgress.name,
      studentEmail: studentProgress.email,
      level: targetPath.levelColor,
      title: projectTitle,
      submissionText: submissionText,
      githubUrl: githubUrl || undefined,
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    setSubmissions([newSubmission, ...submissions]);
    addAuditLog(`Submitted ${targetPath.levelColor} Level project "${projectTitle}" for supervisor evaluation.`, 'info');
    
    // Clear Form
    setProjectTitle('');
    setSubmissionText('');
    setGithubUrl('');
    setFormMessage({ text: 'Project submitted successfully! Our Senior supervisors have queued your work for grading.', isError: false });

    // Auto-clear message after 4 seconds
    setTimeout(() => setFormMessage(null), 5000);
  };

  // Handle Competency Submission
  const handleCompetencySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isSuspended = userAccounts.some(u => u.email === studentProgress.email && u.status === 'suspended');
    if (isSuspended) {
      alert("⚠️ Form Submission Denied: Your candidate account is suspended by administrators.");
      return;
    }
    
    // Find active topic
    const currentTrack = DOJO_TRACKS.find(t => t.id === activeTrackId);
    const currentModule = currentTrack?.modules.find(m => m.id === activeModuleId);
    const currentTopic = currentModule?.topics.find(t => t.id === activeTopicId);
    
    if (!currentTopic) return;

    const targetId = activeTopicId;
    const targetTitle = currentTopic.title;
    
    // Filter out blank links
    const filledLinks = submissionLinks.filter(l => l.url.trim() !== '');

    // Validate that at least some material is provided (either a URL, or an uploaded document/video)
    if (filledLinks.length === 0 && uploadedFiles.length === 0 && !screenRecordingUrl.trim()) {
      setCompetenceMessage({ 
        text: 'Please provide at least one valid submission asset (such as a generic URL link, an uploaded document, or a screen recording).', 
        isError: true 
      });
      return;
    }

    // Validate URLs
    for (const link of filledLinks) {
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        setCompetenceMessage({ 
          text: `Please enter a valid URL starting with http:// or https:// for "${link.url}"`, 
          isError: true 
        });
        return;
      }
    }

    // Check if already submitted
    const isAlreadySubmitted = submissions.some(
      s => s.studentEmail === studentProgress.email && s.topicId === targetId && s.status === 'pending'
    );
    if (isAlreadySubmitted || submittedTopics.includes(targetId)) {
      setCompetenceMessage({ text: 'You already have a pending or graded evaluation for this topic.', isError: true });
      return;
    }

    // Determine matching proficiency level based on track or student progress
    const activeLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' = studentProgress.currentLevel;

    // Compile fallbacks for backward compatibility (e.g., older components looking for single fields)
    const fallbackGithub = filledLinks[0]?.url || '';
    const fallbackLocalhost = filledLinks[0]?.description || 'Provided via generic link.';
    const fallbackVideo = uploadedFiles.find(f => f.type === 'video')?.name || screenRecordingUrl || '';

    const newSubmission: Submission = {
      id: `sub-comp-${Date.now()}`,
      studentName: studentProgress.name,
      studentEmail: studentProgress.email,
      level: activeLevel,
      title: `Topic Verification: ${targetTitle}`,
      submissionText: competenceText.trim() || `Demonstrating understanding for "${targetTitle}" under ${currentModule?.title}.`,
      githubUrl: fallbackGithub,
      localhostDetails: fallbackLocalhost,
      videoDemoUrl: fallbackVideo,
      submissionType: 'competence',
      trackId: activeTrackId,
      moduleId: activeModuleId,
      topicId: targetId,
      status: 'pending',
      submittedAt: new Date().toISOString(),
      links: filledLinks,
      files: uploadedFiles
    };

    setSubmissions([newSubmission, ...submissions]);
    
    // Register submission state
    if (!submittedTopics.includes(targetId)) {
      setSubmittedTopics(prev => [...prev, targetId]);
    }
    
    // Update audit log
    addAuditLog(`Submitted topic verification for: "${targetTitle}" (Track: ${currentTrack?.title}).`, 'info');
    
    setCompetenceMessage({ text: 'Topic validation request queued! Our supervisors will review your submission assets.', isError: false });
    
    // Clear dynamic inputs for next time
    setSubmissionLinks([{ url: '', description: '' }]);
    setUploadedFiles([]);
    setScreenRecordingUrl('');
    setCompetenceText('');

    // Auto-clear success message
    setTimeout(() => {
      setCompetenceMessage(null);
    }, 6000);
  };

  // Handle actual file select from student gadget
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is a legacy input handler, we replaced it with handleDocFileChange and handleVideoFileChange
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateGenericFileUpload(file.name, file.size, 'document');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      simulateGenericFileUpload(file.name, file.size, 'video');
    }
  };

  // Simulate document/video file drop/input upload
  const simulateGenericFileUpload = (fileName: string, sizeBytes: number, fileType: 'document' | 'video') => {
    setUploadFileState({
      uploading: true,
      progress: 0,
      fileName: fileName,
      fileSize: (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB',
      fileType: fileType
    });

    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.floor(Math.random() * 25) + 15;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setUploadFileState(prev => ({
          ...prev,
          uploading: false,
          progress: 100
        }));
        
        const sizeStr = (sizeBytes / (1024 * 1024)).toFixed(1) + ' MB';
        setUploadedFiles(prev => [...prev, { name: fileName, size: sizeStr, type: fileType }]);
        addAuditLog(`${fileType === 'video' ? 'Screen recording demonstration' : 'Document asset'} "${fileName}" uploaded successfully.`, 'success');
      } else {
        setUploadFileState(prev => ({
          ...prev,
          progress: currentProgress
        }));
      }
    }, 150);
  };

  // Practice sandbox handlers removed

  // ==========================================
  // MODULE QUIZ & COURSE ASSESSMENT HANDLERS
  // ==========================================
  const getActiveAssessmentData = () => {
    if (assessmentType === 'chapter-quiz' && assessmentModuleId) {
      return MODULE_QUIZZES[assessmentModuleId];
    } else if (assessmentType === 'course-assessment') {
      return OVERALL_ASSESSMENTS[activeTrackId];
    }
    return null;
  };

  const handleAssessmentAnswerSelect = (optionIndex: number) => {
    if (assessmentAnswerChecked) return;
    setAssessmentSelectedAnswers(prev => ({
      ...prev,
      [activeQuestionIndex]: optionIndex
    }));
  };

  const checkAssessmentAnswer = () => {
    if (assessmentSelectedAnswers[activeQuestionIndex] === undefined) return;
    setAssessmentAnswerChecked(true);
    setAssessmentShowExplanation(true);
  };

  const handleNextAssessmentQuestion = () => {
    const data = getActiveAssessmentData();
    if (!data) return;

    setAssessmentAnswerChecked(false);
    setAssessmentShowExplanation(false);

    if (activeQuestionIndex < data.objectiveQuestions.length - 1) {
      setActiveQuestionIndex(prev => prev + 1);
    } else {
      // Finished all multiple-choice questions! Move to subjective section
      setAssessmentStep('subjective');
    }
  };

  // Run the Automatic AI evaluation (or check keyword density)
  const handleAutoEvaluateSubjective = (e: React.FormEvent) => {
    e.preventDefault();
    const data = getActiveAssessmentData();
    if (!data) return;

    if (subjectiveResponse.trim().length < 30) {
      alert("Please write a more detailed response (at least 30 characters) to analyze.");
      return;
    }

    setIsAssessmentSubmitting(true);

    // Simulate AI computing/processing
    setTimeout(() => {
      setIsAssessmentSubmitting(false);

      // Simple keyword match score
      const text = subjectiveResponse.toLowerCase();
      let matchCount = 0;
      data.subjectiveQuestion.sampleKeywords.forEach(kw => {
        if (text.includes(kw.toLowerCase())) {
          matchCount++;
        }
      });

      const densityPercentage = data.subjectiveQuestion.sampleKeywords.length > 0 
        ? matchCount / data.subjectiveQuestion.sampleKeywords.length 
        : 1;
      
      // Calculate a realistic score between 65 and 98 based on density
      const subjectiveScore = Math.round(68 + (densityPercentage * 30));
      
      // Calculate multiple-choice correct count
      let correctObjCount = 0;
      data.objectiveQuestions.forEach((q, qIdx) => {
        if (assessmentSelectedAnswers[qIdx] === q.correctIndex) {
          correctObjCount++;
        }
      });

      const weightedScore = Math.round(((correctObjCount / data.objectiveQuestions.length) * 100 * 0.4) + (subjectiveScore * 0.6));
      const passed = weightedScore >= 70;

      // Update local storage record
      const completionRecord = {
        objectiveScore: correctObjCount,
        objectiveTotal: data.objectiveQuestions.length,
        subjectiveScore: subjectiveScore,
        subjectiveFeedback: passed 
          ? `🤖 AI Automated Evaluation: Successfully identified core architecture components including [${data.subjectiveQuestion.sampleKeywords.filter(k => text.includes(k.toLowerCase())).join(', ') || 'key patterns'}]. Good engineering choices.` 
          : `🤖 AI Automated Evaluation: Missing some key architectural parameters. Be sure to address: ${data.subjectiveQuestion.sampleKeywords.join(', ')}. Please try again to raise your score.`,
        status: passed ? 'completed' : 'pending',
        completedAt: new Date().toISOString()
      };

      if (assessmentType === 'chapter-quiz' && assessmentModuleId) {
        setCompletedQuizzes(prev => ({
          ...prev,
          [assessmentModuleId]: completionRecord as any
        }));
      } else {
        setCompletedOverallAssessments(prev => ({
          ...prev,
          [activeTrackId]: completionRecord as any
        }));
      }

      setSubjectiveGradedState({
        status: 'graded',
        score: subjectiveScore,
        feedback: completionRecord.subjectiveFeedback,
        gradedBy: '🤖 AI Grader Engine',
        gradedAt: new Date().toLocaleDateString()
      });

      if (passed) {
        const pointsAwarded = assessmentType === 'chapter-quiz' ? 20 : 50;
        setStudentProgress(prev => ({
          ...prev,
          points: prev.points + pointsAwarded
        }));
        addAuditLog(`Aced ${assessmentType === 'chapter-quiz' ? 'Chapter Quiz' : 'Course Assessment'}! Earned +${pointsAwarded} points.`, 'success');
      } else {
        addAuditLog(`Completed assessment but did not meet 70% threshold. Try revising details.`, 'warning');
      }

      setAssessmentStep('results');
    }, 1500);
  };

  // Submit for manual supervisor grading, with direct sandbox supervisor controls
  const handleSubmitManualGrading = () => {
    const data = getActiveAssessmentData();
    if (!data) return;

    if (subjectiveResponse.trim().length < 30) {
      alert("Please write a more detailed response (at least 30 characters) before submitting.");
      return;
    }

    setIsAssessmentSubmitting(true);

    setTimeout(() => {
      setIsAssessmentSubmitting(false);

      let correctObjCount = 0;
      data.objectiveQuestions.forEach((q, qIdx) => {
        if (assessmentSelectedAnswers[qIdx] === q.correctIndex) {
          correctObjCount++;
        }
      });

      const submissionRecord = {
        objectiveScore: correctObjCount,
        objectiveTotal: data.objectiveQuestions.length,
        subjectiveScore: null,
        subjectiveFeedback: null,
        status: 'pending',
        completedAt: new Date().toISOString()
      };

      if (assessmentType === 'chapter-quiz' && assessmentModuleId) {
        setCompletedQuizzes(prev => ({
          ...prev,
          [assessmentModuleId]: submissionRecord as any
        }));
      } else {
        setCompletedOverallAssessments(prev => ({
          ...prev,
          [activeTrackId]: submissionRecord as any
        }));
      }

      setSubjectiveGradedState({
        status: 'pending',
        score: null,
        feedback: null,
        gradedBy: null,
        gradedAt: null
      });

      addAuditLog(`Submitted subjective case study to instructor evaluation queue.`, 'info');
      setAssessmentStep('results');
    }, 1000);
  };

  // Admin Sandbox Manual Evaluation Simulator
  const handleSimulateManualGrading = () => {
    const data = getActiveAssessmentData();
    if (!data) return;

    // Generate a beautiful, realistic score and feedback
    const scoreVal = Math.floor(Math.random() * 15) + 84; // 84 to 98
    const grader = assessmentType === 'chapter-quiz' ? 'Lead Evaluator Kenji' : 'Senior Director Hiroshi';
    const feedbackText = data.subjectiveQuestion.defaultInstructorFeedback;

    let correctObjCount = 0;
    data.objectiveQuestions.forEach((q, qIdx) => {
      if (assessmentSelectedAnswers[qIdx] === q.correctIndex) {
        correctObjCount++;
      }
    });

    const completionRecord = {
      objectiveScore: correctObjCount,
      objectiveTotal: data.objectiveQuestions.length,
      subjectiveScore: scoreVal,
      subjectiveFeedback: `👤 Supervisor Review (${grader}): "${feedbackText}"`,
      status: 'graded',
      completedAt: new Date().toISOString()
    };

    if (assessmentType === 'chapter-quiz' && assessmentModuleId) {
      setCompletedQuizzes(prev => ({
        ...prev,
        [assessmentModuleId]: completionRecord as any
      }));
    } else {
      setCompletedOverallAssessments(prev => ({
        ...prev,
        [activeTrackId]: completionRecord as any
      }));
    }

    setSubjectiveGradedState({
      status: 'graded',
      score: scoreVal,
      feedback: completionRecord.subjectiveFeedback,
      gradedBy: grader,
      gradedAt: new Date().toLocaleDateString()
    });

    // Award Points
    const pointsAwarded = assessmentType === 'chapter-quiz' ? 20 : 50;
    setStudentProgress(prev => ({
      ...prev,
      points: prev.points + pointsAwarded
    }));

    addAuditLog(`Supervisor graded your submission: ${scoreVal}/100. Awarded +${pointsAwarded} points!`, 'success');
  };

  const renderAssessmentWorkstation = () => {
    const data = getActiveAssessmentData();
    if (!data) {
      return (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center space-y-4">
          <p className="text-sm text-gray-500">Error: Assessment data not found or course selection is incorrect.</p>
        </div>
      );
    }

    const currentTrack = DOJO_TRACKS.find(t => t.id === activeTrackId);
    
    // Calculate final scores if graded
    let correctObjCount = 0;
    data.objectiveQuestions.forEach((q, qIdx) => {
      if (assessmentSelectedAnswers[qIdx] === q.correctIndex) {
        correctObjCount++;
      }
    });

    const objectivePercentage = Math.round((correctObjCount / data.objectiveQuestions.length) * 100);
    const subjectiveScoreVal = subjectiveGradedState.score || 0;
    const finalWeightedAverage = Math.round((objectivePercentage * 0.4) + (subjectiveScoreVal * 0.6));

    if (assessmentStep === 'intro') {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 animate-fadeIn" id="assessment-intro-card">
          <div className="border-b border-gray-100 pb-5 space-y-3">
            <span className="text-[10px] font-mono text-crimson-600 font-bold uppercase tracking-widest bg-crimson-50 border border-crimson-100 px-2.5 py-1 rounded inline-block">
              {assessmentType === 'chapter-quiz' ? 'Chapter Knowledge Check' : 'Comprehensive Final Exam'}
            </span>
            <h3 className="text-2xl font-sans font-extrabold text-navy-950 tracking-tight leading-tight">
              {data.title}
            </h3>
            <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
              This interactive workstation evaluates your core knowledge and application. You must clear both objective questions and the engineering case study to lock in points and verify certifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="assessment-intro-stats">
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-crimson-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase block leading-none">Objective Section</span>
                <span className="text-xs font-sans font-bold text-navy-950 mt-1 block">
                  {data.objectiveQuestions.length} Multiple-Choice (40% Weight)
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center gap-3">
              <Award className="w-5 h-5 text-crimson-600 shrink-0" />
              <div className="text-left">
                <span className="text-[10px] font-mono text-gray-400 uppercase block leading-none">Subjective Section</span>
                <span className="text-xs font-sans font-bold text-navy-950 mt-1 block">
                  1 Engineering Case Study (60% Weight)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-navy-950 text-white rounded-xl p-5 text-xs space-y-2.5 leading-relaxed">
            <h4 className="font-mono font-bold text-crimson-400 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Grading Policy & Core Guidelines
            </h4>
            <ul className="list-disc list-inside space-y-1.5 text-gray-300 font-sans">
              <li>Objective answers are instantly evaluated and feedback is provided immediately.</li>
              <li>Subjective design proposals can be automatically graded via our <strong className="text-white">AI Grader Engine</strong> or submitted for manual grading in the senior evaluator queue.</li>
              <li>A total weighted score of <strong className="text-crimson-400">70% or higher</strong> is required to unlock certification points (<strong className="text-white">+{assessmentType === 'chapter-quiz' ? 20 : 50} Dojo Points</strong>).</li>
            </ul>
          </div>

          <button
            onClick={() => setAssessmentStep('objective')}
            className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-3.5 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-crimson-950/20"
          >
            <Play className="w-4 h-4 fill-white animate-pulse" /> Start Evaluation Workstation
          </button>
        </div>
      );
    }

    if (assessmentStep === 'objective') {
      const currentQuestion = data.objectiveQuestions[activeQuestionIndex];
      const selectedOption = assessmentSelectedAnswers[activeQuestionIndex];
      const isCorrect = selectedOption === currentQuestion.correctIndex;

      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 animate-fadeIn" id="assessment-objective-card">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
              Question {activeQuestionIndex + 1} of {data.objectiveQuestions.length}
            </span>
            <div className="w-24 bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-crimson-600 h-full transition-all duration-300"
                style={{ width: `${((activeQuestionIndex + 1) / data.objectiveQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-base font-sans font-extrabold text-navy-950 tracking-tight leading-snug">
              {currentQuestion.question}
            </h4>

            <div className="space-y-2.5">
              {currentQuestion.options.map((option, oIdx) => {
                const isSelected = selectedOption === oIdx;
                let optionStyle = 'border-gray-200 hover:bg-gray-50 text-gray-700 bg-white';
                
                if (assessmentAnswerChecked) {
                  if (oIdx === currentQuestion.correctIndex) {
                    optionStyle = 'bg-green-50 border-green-300 text-green-900 font-semibold';
                  } else if (isSelected) {
                    optionStyle = 'bg-red-50 border-red-300 text-red-900';
                  } else {
                    optionStyle = 'bg-gray-50/50 border-gray-100 text-gray-400 cursor-not-allowed';
                  }
                } else if (isSelected) {
                  optionStyle = 'bg-crimson-50 border-crimson-300 text-crimson-900 font-semibold shadow-sm';
                }

                return (
                  <button
                    key={oIdx}
                    disabled={assessmentAnswerChecked}
                    onClick={() => handleAssessmentAnswerSelect(oIdx)}
                    className={`w-full p-4 rounded-xl border text-xs text-left transition-all duration-150 flex items-start gap-3 cursor-pointer ${optionStyle}`}
                  >
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                      assessmentAnswerChecked && oIdx === currentQuestion.correctIndex 
                        ? 'bg-green-500 border-green-600 text-white' 
                        : isSelected 
                          ? 'bg-crimson-600 border-crimson-700 text-white' 
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {String.fromCharCode(65 + oIdx)}
                    </span>
                    <span className="leading-relaxed font-sans">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {assessmentShowExplanation && (
            <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 animate-fadeIn ${
              isCorrect ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'
            }`}>
              <h5 className="font-mono font-bold uppercase tracking-wider text-[9px] flex items-center gap-1.5 leading-none">
                {isCorrect ? <CheckCircle className="w-4 h-4 text-green-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
                {isCorrect ? 'Correct Answer Verified' : 'Explanation & Corrective Guidance'}
              </h5>
              <p className="font-sans font-medium">{currentQuestion.explanation}</p>
            </div>
          )}

          <div className="flex gap-3">
            {!assessmentAnswerChecked ? (
              <button
                onClick={checkAssessmentAnswer}
                disabled={selectedOption === undefined}
                className={`w-full py-3.5 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 ${
                  selectedOption === undefined 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                    : 'bg-navy-950 hover:bg-navy-900 text-white cursor-pointer'
                }`}
              >
                Submit Answer Response
              </button>
            ) : (
              <button
                onClick={handleNextAssessmentQuestion}
                className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-3.5 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                {activeQuestionIndex < data.objectiveQuestions.length - 1 ? 'Next Question' : 'Proceed to Subjective Case Study'}
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      );
    }

    if (assessmentStep === 'subjective') {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 animate-fadeIn" id="assessment-subjective-card">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-crimson-600 font-bold uppercase tracking-widest block leading-none">Section 2: Subjective Engineering Analysis</span>
              <h4 className="text-lg font-sans font-extrabold text-navy-950 mt-1.5 leading-none">Scenario-Based Case Study</h4>
            </div>
            <Award className="w-6 h-6 text-crimson-600" />
          </div>

          <div className="p-5 bg-navy-50/50 border border-navy-100 rounded-xl space-y-3 text-left">
            <h5 className="font-sans font-bold text-sm text-navy-950 leading-tight">Design Prompt Challenge:</h5>
            <p className="text-xs text-navy-900 leading-relaxed font-sans">{data.subjectiveQuestion.prompt}</p>
          </div>

          <div className="space-y-2 text-left bg-gray-50 border border-gray-200 rounded-xl p-4">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Required Criteria & Guidelines</span>
            <p className="text-[11px] text-gray-600 leading-relaxed font-sans mt-1">{data.subjectiveQuestion.guidelines}</p>
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {data.subjectiveQuestion.sampleKeywords.map((kw, kIdx) => (
                <span key={kIdx} className="text-[9px] font-mono bg-white border border-gray-200 text-navy-900 px-2 py-0.5 rounded">
                  #{kw}
                </span>
              ))}
            </div>
          </div>

          <form onSubmit={handleAutoEvaluateSubjective} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-widest block">
                Your Engineering Response Proposal (Min 30 characters) *
              </label>
              <textarea
                rows={6}
                value={subjectiveResponse}
                onChange={(e) => setSubjectiveResponse(e.target.value)}
                placeholder="Write or paste your architectural layout, code routines, and step-by-step logic here..."
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs text-deep-black focus:border-crimson-500 focus:bg-white focus:outline-none font-sans leading-relaxed font-mono"
                required
              />
              <span className="text-[9px] text-gray-400 font-sans block">
                Be explicit about peripheral clock configurations, buffer management, concurrency protocols, or database rollbacks based on requirements.
              </span>
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-xl p-4 space-y-3">
              <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-widest block">Choose Grading Verification Mode</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGradingOption('auto')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                    gradingOption === 'auto' 
                      ? 'bg-crimson-50 border-crimson-300 text-crimson-900 font-semibold shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-sans font-bold flex items-center gap-1">🤖 AI Auto-Grader</span>
                  <span className="text-[9px] opacity-80 mt-0.5 font-sans">Scans keyword density & provides immediate automated analysis.</span>
                </button>

                <button
                  type="button"
                  onClick={() => setGradingOption('manual')}
                  className={`p-3 rounded-lg border text-left flex flex-col transition-all cursor-pointer ${
                    gradingOption === 'manual' 
                      ? 'bg-crimson-50 border-crimson-300 text-crimson-900 font-semibold shadow-sm' 
                      : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xs font-sans font-bold flex items-center gap-1">👤 Manual Instructor Queue</span>
                  <span className="text-[9px] opacity-80 mt-0.5 font-sans">Places into supervisor grading stack. Allows direct mock grading.</span>
                </button>
              </div>
            </div>

            {gradingOption === 'auto' ? (
              <button
                type="submit"
                disabled={isAssessmentSubmitting}
                className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-3.5 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-crimson-900/10"
              >
                {isAssessmentSubmitting ? '🤖 AI Engine Evaluating Parameters...' : '🤖 Launch AI Automatic Grading'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitManualGrading}
                disabled={isAssessmentSubmitting}
                className="w-full bg-navy-950 hover:bg-navy-900 text-white py-3.5 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                {isAssessmentSubmitting ? 'Logging Submission Record...' : '👤 Publish and Queue for Manual Supervisor Evaluation'}
              </button>
            )}
          </form>
        </div>
      );
    }

    if (assessmentStep === 'results') {
      const passed = finalWeightedAverage >= 70;
      
      return (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 animate-fadeIn" id="assessment-results-card">
          <div className="text-center py-4 space-y-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
              passed 
                ? 'bg-green-50 text-green-600 border border-green-200' 
                : subjectiveGradedState.status === 'pending' 
                  ? 'bg-blue-50 text-blue-600 border border-blue-200 animate-pulse'
                  : 'bg-red-50 text-red-600 border border-red-200'
            }`}>
              {passed ? <Trophy className="w-8 h-8 animate-bounce" /> : <Award className="w-8 h-8" />}
            </div>

            <div className="space-y-1.5">
              <h3 className="text-2xl font-sans font-extrabold text-navy-950 tracking-tight">
                {subjectiveGradedState.status === 'pending' 
                  ? 'Evaluation Request Logged Successfully' 
                  : passed 
                    ? '🎉 Competency Certification Passed!' 
                    : 'Evaluation Result Pending Review'}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                {subjectiveGradedState.status === 'pending'
                  ? 'Your case study has been dispatched to the senior instructor board. Use the Instructor simulation panel below to trigger immediate grading.'
                  : passed
                    ? `You cleared the weighted grading threshold! Points have been credited to your active portfolio.`
                    : 'Your weighted average is currently below 70%. You can revise and resubmit your response or request manual re-evaluation.'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border border-gray-100 rounded-xl p-4 bg-gray-50/50">
            <div className="text-center space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase">Objective Score</span>
              <span className="text-xs font-sans font-bold text-navy-950 block">
                {correctObjCount} / {data.objectiveQuestions.length} ({objectivePercentage}%)
              </span>
            </div>

            <div className="text-center space-y-1 border-x border-gray-200">
              <span className="text-[9px] font-mono text-gray-400 uppercase">Subjective Score</span>
              <span className="text-xs font-sans font-bold text-navy-950 block">
                {subjectiveGradedState.status === 'pending' ? 'PENDING' : `${subjectiveScoreVal} / 100`}
              </span>
            </div>

            <div className="text-center space-y-1">
              <span className="text-[9px] font-mono text-gray-400 uppercase">Weighted Average</span>
              <span className={`text-xs font-sans font-bold block ${
                subjectiveGradedState.status === 'pending' ? 'text-gray-400' : passed ? 'text-green-600' : 'text-red-500'
              }`}>
                {subjectiveGradedState.status === 'pending' ? 'PENDING' : `${finalWeightedAverage}%`}
              </span>
            </div>
          </div>

          {/* Grader detailed feedback box */}
          {subjectiveGradedState.status === 'graded' && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-left space-y-2">
              <h5 className="font-mono font-bold uppercase tracking-wider text-[9px] text-gray-400 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" /> Evaluation Feedback & Notes
              </h5>
              <p className="text-xs font-sans text-navy-950 leading-relaxed italic">
                "{subjectiveGradedState.feedback}"
              </p>
              <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 pt-2 border-t border-gray-100 mt-2">
                <span>Evaluated By: {subjectiveGradedState.gradedBy}</span>
                <span>Date: {subjectiveGradedState.gradedAt}</span>
              </div>
            </div>
          )}

          {/* Supervisor Simulation Console (Direct Mock Action) */}
          {subjectiveGradedState.status === 'pending' && (
            <div className="bg-navy-950 text-white rounded-xl p-5 text-left space-y-4 border border-navy-800">
              <div className="space-y-1">
                <span className="text-[9px] font-mono text-crimson-400 font-bold uppercase tracking-wider">Instructor Simulation Sandbox</span>
                <h5 className="text-xs font-sans font-bold">Supervisor Sandbox Controls</h5>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  In a production environment, senior engineering instructors receive this request on their management dashboard. Simulate a supervisor grading this paper now to view manual scoring feedback.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSimulateManualGrading}
                className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-2.5 rounded-lg font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Cpu className="w-4 h-4" /> Simulate Manual Review & Grade Instantly
              </button>
            </div>
          )}

          <div className="flex gap-3">
            {!passed && subjectiveGradedState.status === 'graded' && (
              <button
                onClick={() => setAssessmentStep('subjective')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-sans font-bold text-xs transition-colors cursor-pointer"
              >
                Try Revising Answer
              </button>
            )}
            <button
              onClick={() => {
                setAssessmentActive(false);
              }}
              className="flex-1 bg-navy-950 hover:bg-navy-900 text-white py-3 rounded-xl font-sans font-bold text-xs transition-colors cursor-pointer text-center"
            >
              Complete and Close Workstation
            </button>
          </div>
        </div>
      );
    }

    return null;
  };

  // Get student certifications from credentials array
  const myCerts = credentials.filter(c => c.studentEmail === studentProgress.email);
  const pendingSubmissions = submissions.filter(
    s => s.studentEmail === studentProgress.email && s.status === 'pending'
  );
  const gradedSubmissions = submissions.filter(
    s => s.studentEmail === studentProgress.email && s.status !== 'pending'
  );

  return (
    <div className="space-y-8" id="student-dashboard">
      
      {/* Account Suspended Warning Banner */}
      {userAccounts.some(u => u.email === studentProgress.email && u.status === 'suspended') && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-5 flex items-start gap-4 text-left shadow-sm animate-pulse" id="suspended-warning-banner">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-sans font-bold text-red-800">Your Student Account has been Temporarily Suspended</h4>
            <p className="text-xs text-red-600 leading-relaxed">
              Platform administration has suspended your account privileges. You can browse tracks and materials, but you are forbidden from submitting assignments, completing quizzes, or earning proficiency level certification points until active privileges are granted by administrators.
            </p>
          </div>
        </div>
      )}
      
      {/* OVERVIEW TAB (HIGH-FIDELITY LANDING DASHBOARD) */}
      {activeTab === 'student-overview' && (
        <div className="space-y-10 animate-fadeIn" id="tab-student-overview">
          
          {categoryViewMode !== null ? (
            /* DEDICATED LEVEL-CATEGORIZED COURSES PAGE */
            <div className="space-y-8 text-left animate-fadeIn" id="category-courses-directory-page">
              {/* Breadcrumb / Back Navigation header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setCategoryViewMode(null);
                      addAuditLog("Returned to Home overview.", 'info');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-gray-500 hover:text-crimson-600 transition-colors cursor-pointer mb-2"
                    id="back-to-dashboard-btn"
                  >
                    ← Back to Home
                  </button>
                  <h2 className="text-3xl font-sans font-extrabold tracking-tight text-navy-950 flex items-center gap-2">
                    <span>{categoryViewMode === 'Hardware' ? '📟' : categoryViewMode === 'Software' ? '💻' : '📊'}</span>
                    <span>All {categoryViewMode} Courses</span>
                  </h2>
                  <p className="text-xs text-gray-500 font-sans">
                    Explore our standard-mapped curriculum modules spanning Beginner, Intermediate, Advanced, and Expert levels.
                  </p>
                </div>

                {/* Simulated stats inspired by screenshots */}
                <div className="flex items-center gap-6 bg-gray-50 border border-gray-150 p-4 rounded-xl shrink-0">
                  <div className="text-center px-1">
                    <span className="block text-xl font-sans font-extrabold text-navy-950">
                      {categoryViewMode === 'Hardware' ? '12,842' : categoryViewMode === 'Software' ? '45,210' : '23,105'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Learners</span>
                  </div>
                  <div className="h-8 border-l border-gray-200" />
                  <div className="text-center px-1">
                    <span className="block text-xl font-sans font-extrabold text-navy-950">8</span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Courses</span>
                  </div>
                  <div className="h-8 border-l border-gray-200" />
                  <div className="text-center px-1">
                    <span className="block text-xl font-sans font-extrabold text-navy-950">4.8 ★</span>
                    <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider">Avg Rating</span>
                  </div>
                </div>
              </div>

              {/* Grouped by levels: Beginner, Intermediate, Advanced, Expert */}
              {(['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const).map((lvl) => {
                const levelCourses = mergedCourses.filter(
                  course => course.category === categoryViewMode && course.level === lvl
                );

                return (
                  <div key={lvl} className="space-y-4" id={`level-section-${lvl.toLowerCase()}`}>
                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                      <h3 className="text-lg font-sans font-extrabold text-navy-950">
                        {lvl} Level
                      </h3>
                      <span className="bg-gray-100 text-gray-600 text-xs font-mono font-bold px-2.5 py-0.5 rounded-full">
                        {levelCourses.length} {levelCourses.length === 1 ? 'course' : 'courses'}
                      </span>
                    </div>

                    {levelCourses.length === 0 ? (
                      <div className="p-8 text-center border-2 border-dashed border-gray-150 rounded-xl bg-gray-50/30">
                        <p className="text-sm text-gray-400 font-sans">No courses defined under this proficiency level.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {levelCourses.map((course) => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledCourseIds.includes(course.id)}
                            onLaunch={() => {
                              // Find matching flagship track to navigate to player (by exact ID first, then by category)
                              const matchingTrack = DOJO_TRACKS.find(t => t.id === course.id) || DOJO_TRACKS.find(t => t.category === course.category);
                              if (matchingTrack) {
                                if (enrolledCourseIds.includes(matchingTrack.id)) {
                                  setStartedCourseIds(prev => {
                                    if (!prev.includes(matchingTrack.id)) return [...prev, matchingTrack.id];
                                    return prev;
                                  });
                                }
                                handleTrackChange(matchingTrack.id);
                                setActiveTab('student-curriculum');
                                addAuditLog(`Loaded course player detail screen for: "${matchingTrack.title}".`, 'info');
                              }
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* STANDARD DASHBOARD OVERVIEW */
            <>
              {/* HERO GREETING SECTION */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6" id="hero-greeting-container">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-1" id="greeting-text-block">
                    <h2 className="text-4xl font-sans font-extrabold tracking-tight text-navy-950" id="user-greeting-name">
                      Hello {studentProgress.name},
                    </h2>
                    <p className="text-2xl text-gray-500 font-sans tracking-tight" id="user-greeting-subtitle">
                      what would you like to learn today?
                    </p>
                  </div>

                  {/* Functional Search Bar */}
                  <div className="w-full md:w-96 relative" id="search-bar-wrapper">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-5 h-5" id="search-icon-svg" />
                    </div>
                    <input
                      type="text"
                      id="dashboard-search-input"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        addAuditLog(`Searched for query: "${e.target.value}"`, 'info');
                      }}
                      placeholder="Search topics, tools, or skills..."
                      className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-crimson-500 focus:border-transparent transition-all"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-crimson-600 transition-colors"
                        id="search-clear-btn"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Flagship Tag Pills (Clicking updates category selection and scrolls down to explorer) */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100" id="quick-flagship-pills">
                  <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider mr-2" id="explore-label">
                    Quick Explore:
                  </span>
                  {categories.map((cat) => {
                    let icon = '📁';
                    if (cat === 'Hardware') icon = '📟';
                    if (cat === 'Software') icon = '💻';
                    if (cat === 'Data Science') icon = '📊';

                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedHomeCategory(cat);
                          addAuditLog(`Selected '${cat}' courses category.`, 'info');
                          const sectionEl = document.getElementById('row-3-courses-directory-explorer');
                          if (sectionEl) sectionEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className={`px-4 py-1.5 rounded-full text-xs font-sans font-semibold border transition-all duration-200 cursor-pointer ${
                          selectedHomeCategory === cat
                            ? 'bg-crimson-600 border-crimson-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-crimson-500 hover:text-crimson-600'
                        }`}
                        id={`pill-${cat.toLowerCase().replace(' ', '-')}-explore`}
                      >
                        {icon} {cat} Course
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ROW 1: IN PROGRESS / ACTIVE TRACKS (Now full-width, Syllabus certification status removed) */}
              <div className="space-y-6" id="row-1-tracks-curriculum">
                <div className="flex items-center justify-between" id="in-progress-header-container">
                  <h3 className="text-lg font-sans font-bold text-navy-950 tracking-tight flex items-center gap-2" id="in-progress-title">
                    In progress <span className="bg-crimson-600 text-white text-xs font-mono font-bold px-2.5 py-0.5 rounded-full" id="in-progress-count">{enrolledTracks.length}</span>
                  </h3>
                  <span className="text-xs text-gray-400 font-mono" id="last-active-indicator">Auto-saved to Local Storage</span>
                </div>

                {/* List of Flagship Tracks Cards in a responsive 2-column grid or empty state */}
                {enrolledTracks.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-gray-150 rounded-xl bg-gray-50/30 w-full" id="no-enrolled-tracks-message">
                    <p className="text-sm text-gray-400 font-sans font-medium">You haven't added any active study tracks yet.</p>
                    <p className="text-xs text-gray-400 mt-1 font-sans">Scroll down to "Explore Learning Courses" below to view a course and add it to your workspace!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="active-tracks-list-container">
                    {enrolledTracks.map((track) => {
                      // Calculate customized progress and metadata based on topic completion state
                      const completedCountInTrack = track.modules.reduce((acc, m) => {
                        return acc + m.topics.filter(t => completedTopics.includes(t.id)).length;
                      }, 0);
                      const totalTopicsInTrack = track.modules.reduce((acc, m) => acc + m.topics.length, 0);
                      const percentComplete = totalTopicsInTrack > 0 ? Math.round((completedCountInTrack / totalTopicsInTrack) * 100) : 0;

                      // Customize visual themes per track
                      let visualGradient = 'from-navy-950 to-navy-900';
                      let trackImgIcon = '💻';
                      let durationMeta = '16h lecture video';
                      let trackRefId = track.id;
                      if (track.id === 'track-hardware') {
                        visualGradient = 'from-crimson-950 to-navy-900';
                        trackImgIcon = '📟';
                        durationMeta = '12h lecture video';
                      } else if (track.id === 'track-data') {
                        visualGradient = 'from-emerald-950 to-navy-900';
                        trackImgIcon = '📊';
                        durationMeta = '14h lecture video';
                        trackRefId = 'track-data';
                      }

                      return (
                        <div
                          key={track.id}
                          id={`track-in-progress-card-${track.id}`}
                          onClick={() => {
                            handleTrackChange(trackRefId);
                            setActiveTab('student-curriculum');
                            addAuditLog(`Loaded course player detail screen for: "${track.title}".`, 'info');
                          }}
                          className="bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col sm:flex-row hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group text-left"
                        >
                          {/* Left side: Premium graphic thumbnail with duration overlay */}
                          <div className={`w-full sm:w-44 h-32 shrink-0 bg-gradient-to-tr ${visualGradient} relative flex items-center justify-center`} id={`track-thumb-container-${track.id}`}>
                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
                            <span className="text-4xl select-none transform group-hover:scale-110 transition-transform duration-300" id={`track-thumb-icon-${track.id}`}>{trackImgIcon}</span>
                            <div className="absolute bottom-2 right-2 bg-navy-950/80 backdrop-blur-sm border border-navy-800 text-[9px] font-mono font-bold text-white px-2 py-0.5 rounded" id={`track-duration-${track.id}`}>
                              {durationMeta}
                            </div>
                          </div>

                          {/* Right side: Detailed Course Metadata */}
                          <div className="p-5 flex-1 flex flex-col justify-between space-y-3" id={`track-details-block-${track.id}`}>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between" id={`track-header-row-${track.id}`}>
                                <span className="text-[10px] font-mono font-bold text-crimson-600 uppercase tracking-wider" id={`track-label-${track.id}`}>
                                  COURSE • Flagship Track
                                </span>
                                <span className="text-[10px] font-mono text-gray-400" id={`track-difficulty-${track.id}`}>
                                  {track.difficulty} Level
                                </span>
                              </div>
                              <h4 className="text-base font-sans font-bold text-navy-950 group-hover:text-crimson-600 transition-colors leading-snug" id={`track-title-${track.id}`}>
                                {track.title}
                              </h4>
                              <p className="text-xs text-gray-500 line-clamp-1" id={`track-desc-${track.id}`}>
                                {track.description}
                              </p>
                            </div>

                            {/* Interactive dynamic progress indicators */}
                            <div className="space-y-1" id={`track-progress-block-${track.id}`}>
                              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400 font-bold" id={`track-progress-text-${track.id}`}>
                                <span>SYLLABUS PROGRESS</span>
                                <span className="text-navy-950">{percentComplete}% ({completedCountInTrack}/{totalTopicsInTrack} Units Complete)</span>
                              </div>
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200/40" id={`track-progress-bar-bg-${track.id}`}>
                                <div
                                  className="bg-crimson-600 h-full transition-all duration-300"
                                  style={{ width: `${percentComplete}%` }}
                                  id={`track-progress-bar-fill-${track.id}`}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* See all in My Learning button */}
                <div className="text-right mt-2">
                  <button
                    onClick={() => {
                      setActiveTab('student-learning');
                      addAuditLog("Navigated from Home to My Learning to view all active courses.", 'info');
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-sans font-bold text-crimson-600 hover:text-crimson-700 hover:underline transition-colors focus:outline-none cursor-pointer"
                    id="see-all-my-learning-btn"
                  >
                    See all courses in My Learning ➔
                  </button>
                </div>
              </div>

              {/* ROW 2: TRENDING WEEKLY ACTIVITIES */}
              <div className="space-y-6" id="row-2-trending-topics">
                <div className="flex items-center justify-between" id="trending-header-container">
                  <div>
                    <h3 className="text-xl font-sans font-extrabold text-navy-950 tracking-tight" id="trending-title">
                      See what people at Dojo Hub are learning this week
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">Real-time social stats gathered from our active supervision pipeline</p>
                  </div>

                  {/* Slider Controls */}
                  <div className="flex items-center gap-2" id="slider-arrow-controls">
                    <button
                      onClick={() => addAuditLog("Scrolled trending list left.", "info")}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-crimson-600 transition-colors shadow-sm cursor-pointer"
                      id="trending-scroll-left-btn"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => addAuditLog("Scrolled trending list right.", "info")}
                      className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-crimson-600 transition-colors shadow-sm cursor-pointer"
                      id="trending-scroll-right-btn"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Slider Content Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="trending-grid-layout">
                  {/* Card 1 */}
                  <div
                    onClick={() => handleSelectTopic('track-software', 'sw-mod-1', 'sw-top-11')}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group text-left flex flex-col justify-between h-full"
                    id="trending-card-1"
                  >
                    <div>
                      <div className="h-32 bg-gradient-to-br from-indigo-950 to-navy-900 relative flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform">🥞</span>
                        <span className="absolute bottom-2 right-2 bg-navy-950/80 text-[8px] font-mono text-white px-1.5 py-0.5 rounded">
                          16m watch time
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                          Course Topic • React Core
                        </span>
                        <h4 className="text-xs font-sans font-bold text-navy-950 leading-snug group-hover:text-crimson-600 transition-colors line-clamp-2">
                          Virtual DOM, Fiber Reconciliation, & State Slices
                        </h4>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-end" onClick={(e) => e.stopPropagation()} id="trending-card-1-action">
                      <button
                        onClick={() => {
                          handleSelectTopic('track-software', 'sw-mod-1', 'sw-top-11');
                          setActiveTab('student-curriculum');
                        }}
                        className="text-[10px] font-sans font-bold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer"
                        id="learn-btn-sw-top-11"
                      >
                        Start Learning ➔
                      </button>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    onClick={() => handleSelectTopic('track-hardware', 'hw-mod-1', 'hw-top-12')}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group text-left flex flex-col justify-between h-full"
                    id="trending-card-2"
                  >
                    <div>
                      <div className="h-32 bg-gradient-to-br from-rose-950 to-navy-900 relative flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform">⚙️</span>
                        <span className="absolute bottom-2 right-2 bg-navy-950/80 text-[8px] font-mono text-white px-1.5 py-0.5 rounded">
                          18m watch time
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                          Course Topic • ADC Registers
                        </span>
                        <h4 className="text-xs font-sans font-bold text-navy-950 leading-snug group-hover:text-crimson-600 transition-colors line-clamp-2">
                          Analog-to-Digital Conversion (ADC) Channels
                        </h4>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-end" onClick={(e) => e.stopPropagation()} id="trending-card-2-action">
                      <button
                        onClick={() => {
                          handleSelectTopic('track-hardware', 'hw-mod-1', 'hw-top-12');
                          setActiveTab('student-curriculum');
                        }}
                        className="text-[10px] font-sans font-bold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer"
                        id="learn-btn-hw-top-12"
                      >
                        Start Learning ➔
                      </button>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    onClick={() => handleSelectTopic('track-data', 'ds-mod-1', 'ds-top-11')}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group text-left flex flex-col justify-between h-full"
                    id="trending-card-3"
                  >
                    <div>
                      <div className="h-32 bg-gradient-to-br from-teal-950 to-navy-900 relative flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform">📈</span>
                        <span className="absolute bottom-2 right-2 bg-navy-950/80 text-[8px] font-mono text-white px-1.5 py-0.5 rounded">
                          15m watch time
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                          Course Topic • Python EDA
                        </span>
                        <h4 className="text-xs font-sans font-bold text-navy-950 leading-snug group-hover:text-crimson-600 transition-colors line-clamp-2">
                          Jupyter Notebooks & Pandas Multi-Indexing
                        </h4>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-end" onClick={(e) => e.stopPropagation()} id="trending-card-3-action">
                      <button
                        onClick={() => {
                          handleSelectTopic('track-data', 'ds-mod-1', 'ds-top-11');
                          setActiveTab('student-curriculum');
                        }}
                        className="text-[10px] font-sans font-bold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer"
                        id="learn-btn-ds-top-11"
                      >
                        Start Learning ➔
                      </button>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div
                    onClick={() => handleSelectTopic('track-software', 'sw-mod-2', 'sw-top-21')}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-300 cursor-pointer group text-left flex flex-col justify-between h-full"
                    id="trending-card-4"
                  >
                    <div>
                      <div className="h-32 bg-gradient-to-br from-violet-950 to-navy-900 relative flex items-center justify-center p-4">
                        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                        <span className="text-3xl select-none group-hover:scale-110 transition-transform">🔐</span>
                        <span className="absolute bottom-2 right-2 bg-navy-950/80 text-[8px] font-mono text-white px-1.5 py-0.5 rounded">
                          19m watch time
                        </span>
                      </div>
                      <div className="p-4 space-y-1.5">
                        <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                          Course Topic • Node API Auth
                        </span>
                        <h4 className="text-xs font-sans font-bold text-navy-950 leading-snug group-hover:text-crimson-600 transition-colors line-clamp-2">
                          RESTful Contracts, Input Validation, & JWT Auth
                        </h4>
                      </div>
                    </div>
                    <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex items-center justify-end" onClick={(e) => e.stopPropagation()} id="trending-card-4-action">
                      <button
                        onClick={() => {
                          handleSelectTopic('track-software', 'sw-mod-2', 'sw-top-21');
                          setActiveTab('student-curriculum');
                        }}
                        className="text-[10px] font-sans font-bold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer"
                        id="learn-btn-sw-top-21"
                      >
                        Start Learning ➔
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: COURSES DIRECTORY EXPLORER (REPLACES SPECIALIZATION RECOMMENDATIONS) */}
              <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-6 text-left" id="row-3-courses-directory-explorer">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5" id="dir-header-row">
                  <div className="space-y-1">
                    <h3 className="text-xl font-sans font-extrabold text-navy-950 tracking-tight" id="dir-title">
                      Explore Learning Courses
                    </h3>
                    <p className="text-xs text-gray-500">Select a category to view custom curriculum units. Below them, click 'Show all' to see the complete category view structured by difficulty levels.</p>
                  </div>

                  {/* Category Selection Tabs */}
                  <div className="flex flex-wrap items-center gap-2 bg-gray-50 border border-gray-200/60 p-1 rounded-xl" id="dir-tabs-row">
                    {categories.map((cat) => {
                      const isActive = selectedHomeCategory === cat;
                      let icon = '📁';
                      if (cat === 'Hardware') icon = '📟';
                      if (cat === 'Software') icon = '💻';
                      if (cat === 'Data Science') icon = '📊';

                      return (
                        <button
                          key={cat}
                          id={`tab-select-${cat.toLowerCase().replace(' ', '-')}`}
                          onClick={() => {
                            setSelectedHomeCategory(cat);
                            addAuditLog(`Switched active home category view to ${cat} courses.`, 'info');
                          }}
                          className={`px-4 py-2 rounded-lg text-xs font-sans font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-crimson-600 text-white shadow-sm'
                              : 'text-gray-600 hover:text-navy-950 hover:bg-gray-100'
                          }`}
                        >
                          <span>{icon}</span>
                          <span>{cat} Course</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Display Grid of 4 courses in the active category */}
                {(() => {
                  const activeCourses = mergedCourses.filter(course => course.category === selectedHomeCategory).slice(0, 4);

                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" id="dir-cards-grid">
                        {activeCourses.map((course) => (
                          <CourseCard
                            key={course.id}
                            course={course}
                            isEnrolled={enrolledCourseIds.includes(course.id)}
                            onLaunch={() => {
                              const matchingTrack = DOJO_TRACKS.find(t => t.id === course.id) || DOJO_TRACKS.find(t => t.category === course.category);
                              if (matchingTrack) {
                                if (enrolledCourseIds.includes(matchingTrack.id)) {
                                  setStartedCourseIds(prev => {
                                    if (!prev.includes(matchingTrack.id)) return [...prev, matchingTrack.id];
                                    return prev;
                                  });
                                }
                                handleTrackChange(matchingTrack.id);
                                setActiveTab('student-curriculum');
                                addAuditLog(`Loaded course player detail screen for: "${matchingTrack.title}".`, 'info');
                              }
                            }}
                          />
                        ))}
                      </div>

                      {/* See All Category Courses Button */}
                      <div className="text-center pt-4 border-t border-gray-100" id="show-all-link-wrapper">
                        <button
                          onClick={() => {
                            setCategoryViewMode(selectedHomeCategory);
                            addAuditLog(`Navigated to view all ${selectedHomeCategory} courses grouped by levels.`, 'info');
                          }}
                          className="inline-flex items-center gap-1.5 text-sm font-sans font-extrabold text-crimson-600 hover:text-crimson-700 hover:underline transition-all cursor-pointer group/btn"
                          id="show-all-category-courses-btn"
                        >
                          Show all {selectedHomeCategory} courses ➔
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </>
          )}

        </div>
      )}

      {/* MY LEARNING TAB (LINKEDIN LEARNING "MY CONTENT" INSPIRED) */}
      {activeTab === 'student-learning' && (
        <div className="space-y-8 animate-fadeIn text-left" id="tab-student-learning">
          
          {/* Header with Back to Home Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5" id="learning-center-header">
            <div>
              <h2 className="text-2xl font-sans font-bold text-navy-950 tracking-tight">Student Learning Center</h2>
              <p className="text-xs text-gray-500 mt-1">Manage and trace your active study tracks, certifications, and learning goals.</p>
            </div>
            <button
              onClick={() => {
                setActiveTab('student-overview');
                addAuditLog("Navigated back to Student Home Page.", 'info');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-navy-950 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-auto"
              id="back-to-home-btn"
            >
              <ChevronLeft className="w-4 h-4 text-gray-400" />
              <span>Back to Home Page</span>
            </button>
          </div>

          {/* Progress Indicators Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="learning-progress-metrics">
            {/* Skills followed */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3 relative text-left group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-sans font-bold text-navy-950">Skills</h4>
                  <p className="text-sm font-sans font-extrabold text-navy-950 mt-1">16 followed skills</p>
                </div>
                <button className="text-gray-400 hover:text-navy-950 p-1 hover:bg-gray-100 rounded cursor-pointer">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded-full">Arduino</span>
                <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded-full">React</span>
                <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded-full">Data Sci</span>
                <span className="text-[9px] bg-gray-100 text-gray-600 font-mono px-2 py-0.5 rounded-full">+13 more</span>
              </div>
            </div>

            {/* Skill Evaluations */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm space-y-3 relative text-left flex flex-col justify-between group">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-sans font-bold text-navy-950">Skill Evaluations</h4>
                  <p className="text-sm font-sans font-extrabold text-gray-500 mt-1">0 active evaluations</p>
                </div>
                <span className="text-gray-400 group-hover:text-crimson-600 group-hover:translate-x-1 transition-all duration-200">➔</span>
              </div>
              <p className="text-[10px] text-gray-400 font-mono">Request supervisor reviews via "Submit Competency" tab.</p>
            </div>
          </div>

          {/* Main LinkedIn Layout Split */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8" id="my-learning-split-layout">
            
            {/* Sidebar Categories */}
            <div className="lg:col-span-1 space-y-2 text-left bg-[#aec6e8] border border-[#83a6d4] p-4 rounded-2xl shadow-sm self-start" id="my-learning-categories-sidebar">
              <p className="text-[10px] font-mono font-bold text-[#1e3a60] uppercase tracking-widest px-3 mb-2">My Library</p>
              
              <button className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-white text-crimson-700 border-l-4 border-crimson-600 text-left shadow-sm">
                <span>In progress ({enrolledTracks.length})</span>
                <span className="bg-crimson-600 text-white text-[9px] font-mono px-1.5 py-0.5 rounded-full animate-pulse">Active</span>
              </button>

              <button 
                onClick={() => alert("This section simulates saved bookmarked courses. Currently, you have 19 bookmarked articles.")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#1e3a60] hover:bg-white/40 hover:text-navy-950 transition-colors text-left cursor-pointer"
              >
                <span>Saved (19)</span>
              </button>

              <button 
                onClick={() => alert("This section simulates curated study tracks. Currently, you have 2 custom lists.")}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#1e3a60] hover:bg-white/40 hover:text-navy-950 transition-colors text-left cursor-pointer"
              >
                <span>My collections (2)</span>
              </button>

              <button 
                onClick={() => {
                  setActiveTab('student-certifications');
                  addAuditLog("Navigated to My Certificates tab via My Learning sidebar.", 'info');
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-[#1e3a60] hover:bg-white/40 hover:text-navy-950 transition-colors text-left cursor-pointer"
              >
                <span>Learning history & Certificates ({myCerts.length})</span>
              </button>
            </div>

            {/* Course Cards List */}
            <div className="lg:col-span-3 space-y-8" id="my-learning-courses-list">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="text-base font-sans font-bold text-navy-950">In progress ({enrolledTracks.length})</h3>
                  <span className="text-xs text-gray-400 font-mono">Active Tracks</span>
                </div>

                {/* Vertical Card List */}
                <div className="space-y-4" id="learning-vertical-cards-container">
                  {enrolledTracks.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 w-full">
                      <p className="text-sm text-gray-500 font-sans font-medium">No courses in progress</p>
                      <p className="text-xs text-gray-400 mt-1 font-sans">Enroll in a course and start watching videos or studying to see it here!</p>
                    </div>
                  ) : (
                    enrolledTracks.map((track) => {
                      const completedCountInTrack = track.modules.reduce((acc, m) => {
                        return acc + m.topics.filter(t => completedTopics.includes(t.id)).length;
                      }, 0);
                      const totalTopicsInTrack = track.modules.reduce((acc, m) => acc + m.topics.length, 0);
                      const percentComplete = totalTopicsInTrack > 0 ? Math.round((completedCountInTrack / totalTopicsInTrack) * 100) : 0;

                      // Customize visual themes per track
                      let visualGradient = 'from-navy-950 to-navy-900';
                      let trackImgIcon = '💻';
                      let durationMeta = '1h 32m left';
                      let trackRefId = track.id;
                      if (track.id === 'track-hardware') {
                        visualGradient = 'from-crimson-950 to-navy-900';
                        trackImgIcon = '📟';
                        durationMeta = '2h 14m left';
                      } else if (track.id === 'track-data') {
                        visualGradient = 'from-emerald-950 to-navy-900';
                        trackImgIcon = '📊';
                        durationMeta = '1h 54m left';
                      }

                      return (
                        <div 
                          key={track.id}
                          className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-5 hover:border-gray-300 transition-all text-left relative group"
                          id={`learning-card-${track.id}`}
                        >
                          {/* Left Thumbnail */}
                          <div className={`w-full sm:w-48 h-28 bg-gradient-to-tr ${visualGradient} rounded-lg shrink-0 flex items-center justify-center relative shadow-sm`}>
                            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                            <span className="text-4xl select-none group-hover:scale-105 transition-transform duration-300">{trackImgIcon}</span>
                            <div className="absolute bottom-2 right-2 bg-navy-950/85 text-[9px] font-mono font-bold text-white px-2 py-0.5 rounded border border-navy-800">
                              {durationMeta}
                            </div>
                          </div>

                          {/* Right Details */}
                          <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 space-y-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono font-extrabold text-crimson-600 uppercase tracking-widest">COURSE</span>
                                <span className="text-gray-300">•</span>
                                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">{track.difficulty} Level</span>
                              </div>
                              
                              <h4 
                                onClick={() => {
                                  handleTrackChange(trackRefId);
                                  setActiveTab('student-curriculum');
                                  addAuditLog(`Loaded course player: "${track.title}" from My Learning page.`, 'info');
                                }}
                                className="text-base font-sans font-extrabold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer leading-tight truncate"
                              >
                                {track.title}
                              </h4>
                              
                              <p className="text-xs text-gray-500 line-clamp-1">
                                {track.description}
                              </p>
                            </div>

                            {/* Progress Bar & Actions */}
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-navy-950">{percentComplete}% Complete</span>
                                  <span>•</span>
                                  <span>{completedCountInTrack} / {totalTopicsInTrack} Units Complete</span>
                                </div>
                                <span className="font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Dojo Certified Path</span>
                              </div>
                              
                              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden border border-gray-200/50">
                                <div 
                                  className="bg-crimson-600 h-full transition-all duration-300"
                                  style={{ width: `${percentComplete}%` }}
                                />
                              </div>

                              <div className="flex items-center justify-between pt-1" id="card-actions-row">
                                <button
                                  onClick={() => {
                                    handleTrackChange(trackRefId);
                                    setActiveTab('student-curriculum');
                                    addAuditLog(`Loaded course player: "${track.title}" from My Learning page.`, 'info');
                                  }}
                                  className="px-4 py-1.5 bg-navy-950 hover:bg-crimson-600 text-white font-sans font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                                >
                                  Resume Course
                                </button>

                                <button
                                  onClick={() => {
                                    const url = `${window.location.origin}/courses/${trackRefId}`;
                                    navigator.clipboard.writeText(url);
                                    alert(`Copied course share link to clipboard:\n${url}`);
                                    addAuditLog(`Copied share link for course: "${track.title}".`, 'success');
                                  }}
                                  className="px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-navy-950 hover:bg-gray-50 font-sans font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Enrolled but Not Started Section */}
              {(() => {
                const enrolledNotStartedTracks = visibleTracks.filter(track => enrolledCourseIds.includes(track.id) && !isCourseInProgress(track.id));
                if (enrolledNotStartedTracks.length === 0) return null;

                return (
                  <div className="space-y-4 pt-6 border-t border-gray-100" id="my-learning-enrolled-not-started">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-sans font-bold text-navy-950">Enrolled (Not Started) ({enrolledNotStartedTracks.length})</h3>
                      <span className="text-xs text-gray-400 font-mono">Pending Tracks</span>
                    </div>

                    <div className="space-y-4">
                      {enrolledNotStartedTracks.map((track) => {
                        let visualGradient = 'from-navy-950 to-navy-900';
                        let trackImgIcon = '💻';
                        let trackRefId = track.id;
                        if (track.id === 'track-hardware') {
                          visualGradient = 'from-crimson-950 to-navy-900';
                          trackImgIcon = '📟';
                        } else if (track.id === 'track-data') {
                          visualGradient = 'from-emerald-950 to-navy-900';
                          trackImgIcon = '📊';
                        }

                        return (
                          <div 
                            key={track.id}
                            className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-5 hover:border-gray-300 transition-all text-left relative group opacity-90 hover:opacity-100"
                            id={`enrolled-not-started-card-${track.id}`}
                          >
                            {/* Left Thumbnail */}
                            <div className={`w-full sm:w-48 h-28 bg-gradient-to-tr ${visualGradient} rounded-lg shrink-0 flex items-center justify-center relative shadow-sm`}>
                              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                              <span className="text-4xl select-none group-hover:scale-105 transition-transform duration-300">{trackImgIcon}</span>
                              <div className="absolute bottom-2 right-2 bg-amber-600 text-[9px] font-mono font-bold text-white px-2 py-0.5 rounded border border-amber-500">
                                Not Started
                              </div>
                            </div>

                            {/* Right Details */}
                            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5 space-y-3">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-extrabold text-crimson-600 uppercase tracking-widest">COURSE</span>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">{track.difficulty} Level</span>
                                </div>
                                
                                <h4 
                                  onClick={() => {
                                    setStartedCourseIds(prev => {
                                      if (!prev.includes(trackRefId)) return [...prev, trackRefId];
                                      return prev;
                                    });
                                    handleTrackChange(trackRefId);
                                    setActiveTab('student-curriculum');
                                    addAuditLog(`Loaded course player: "${track.title}" from My Learning page.`, 'info');
                                  }}
                                  className="text-base font-sans font-extrabold text-navy-950 hover:text-crimson-600 transition-colors cursor-pointer leading-tight truncate"
                                >
                                  {track.title}
                                </h4>
                                
                                <p className="text-xs text-gray-500 line-clamp-1">
                                  {track.description}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center justify-between pt-1">
                                <button
                                  onClick={() => {
                                    setStartedCourseIds(prev => {
                                      if (!prev.includes(trackRefId)) return [...prev, trackRefId];
                                      return prev;
                                    });
                                    handleTrackChange(trackRefId);
                                    setActiveTab('student-curriculum');
                                    addAuditLog(`Started course: "${track.title}" from My Learning page.`, 'info');
                                  }}
                                  className="px-4 py-1.5 bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                                >
                                  Start Studying Course
                                </button>

                                <button
                                  onClick={() => {
                                    const url = `${window.location.origin}/courses/${trackRefId}`;
                                    navigator.clipboard.writeText(url);
                                    alert(`Copied course share link to clipboard:\n${url}`);
                                    addAuditLog(`Copied share link for course: "${track.title}".`, 'success');
                                  }}
                                  className="px-3 py-1.5 border border-gray-200 hover:border-gray-300 text-gray-600 hover:text-navy-950 hover:bg-gray-50 font-sans font-medium rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Share</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      )}

      {/* TRACKS & SYLLABUS TAB */}
      {activeTab === 'student-curriculum' && (
        <div className="space-y-8 animate-fadeIn" id="tab-student-tracks-syllabus">
          
          {/* Active Course Header Banner */}
          {(() => {
            const currentTrack = DOJO_TRACKS.find(t => t.id === activeTrackId) || DOJO_TRACKS[1];
            const isEnrolled = enrolledCourseIds.includes(currentTrack.id);
            const completedCount = currentTrack.modules.reduce((acc, m) => {
              return acc + m.topics.filter(t => completedTopics.includes(t.id)).length;
            }, 0);
            const totalTopicsCount = currentTrack.modules.reduce((acc, m) => acc + m.topics.length, 0);
            const progressPercentage = totalTopicsCount > 0 ? Math.round((completedCount / totalTopicsCount) * 100) : 0;

            return (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 text-left" id="track-selection-banner">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-crimson-600 font-bold uppercase tracking-widest bg-crimson-50 border border-crimson-100 px-2.5 py-1 rounded">
                        {currentTrack.category} Track
                      </span>
                      <span className="text-[10px] font-mono text-gray-500 font-bold uppercase tracking-widest bg-gray-100 border border-gray-200 px-2 py-1 rounded">
                        {currentTrack.difficulty}
                      </span>
                      {!isEnrolled && (
                        <span className="text-[10px] font-mono text-amber-700 font-bold uppercase bg-amber-50 border border-amber-100 px-2 py-1 rounded animate-pulse">
                          Preview Mode
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-sans font-extrabold text-deep-black mt-2 flex items-center gap-2 leading-tight">
                      <span className="text-2xl">{currentTrack.icon}</span>
                      <span>{currentTrack.title}</span>
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-3xl">
                      {currentTrack.description}
                    </p>
                  </div>
                  
                  {/* Action Navigation Buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-start md:self-center">
                    {/* Back to Home Button */}
                    <button
                      onClick={() => {
                        setActiveTab('student-overview');
                        addAuditLog("Returned to Home overview.", 'info');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-navy-950 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                      id="curriculum-back-home-btn"
                    >
                      <Home className="w-3.5 h-3.5 text-gray-500" />
                      <span>Back to Home</span>
                    </button>

                    {/* Back to My Learning Button */}
                    <button
                      onClick={() => {
                        setActiveTab('student-learning');
                        addAuditLog("Returned to Learning Center.", 'info');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-gray-50 text-navy-950 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                      id="curriculum-back-learning-btn"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                      <span>Back to My Learning</span>
                    </button>

                    {/* Enroll / Unenroll Button */}
                    {!isEnrolled ? (
                      <button
                        onClick={() => handleEnrollCourse(currentTrack.id, currentTrack.title)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
                        id="curriculum-enroll-btn"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Enroll in Course</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnenrollCourse(currentTrack.id, currentTrack.title)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
                        id="curriculum-unenroll-btn"
                      >
                        <span>Unenroll</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress bar displayed ONLY when enrolled */}
                {isEnrolled ? (
                  <div className="border-t border-gray-100 pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500 mb-1.5">
                        <span>COURSE STUDY PROGRESS</span>
                        <span className="text-crimson-600">{progressPercentage}% ({completedCount}/{totalTopicsCount} topics completed)</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/30">
                        <div 
                          className="bg-crimson-600 h-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/60 border border-amber-200/30 rounded-xl p-3.5 text-xs text-amber-800 text-left flex items-start gap-2.5">
                    <span className="text-sm">💡</span>
                    <span>You are currently previewing this course. Click <strong className="text-amber-950 font-bold">"Enroll in Course"</strong> to register, track your progress, unlock assignments, submit evaluations, and earn credentials!</span>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Two-Column learning workspace */}
          {(() => {
            const currentTrack = DOJO_TRACKS.find(t => t.id === activeTrackId) || DOJO_TRACKS[1];
            const currentModule = currentTrack.modules.find(m => m.id === activeModuleId) || currentTrack.modules[0];
            const currentTopic = currentModule.topics.find(t => t.id === activeTopicId) || currentModule.topics[0];

            // Helper to get matching subtitle segment
            const activeSubtitle = currentTopic ? ([...currentTopic.subtitles]
              .reverse()
              .find(sub => videoTime >= sub.time) || currentTopic.subtitles[0]) : undefined;

            // Helper to format MM:SS
            const formatVideoTime = (seconds: number) => {
              const m = Math.floor(seconds / 60);
              const s = Math.floor(seconds % 60);
              return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };

            const parseDurationToSeconds = (durationStr: string) => {
              const [m, s] = durationStr.split(':').map(Number);
              return m * 60 + s;
            };

            const maxSecs = currentTopic ? parseDurationToSeconds(currentTopic.duration) : 0;

            const targetId = currentTopic?.id;
            const targetTitle = currentTopic?.title;

            // Submissions filtering for active topic or task
            const activeTopicSubmission = submissions.find(
              s => s.studentEmail === studentProgress.email && s.topicId === targetId
            );

            const renderVerificationWorkspace = () => {
              if (!targetId) return null;

              return (
                <div className="space-y-6 mt-6" id="verification-workspace-section">
                  <div className="border-t border-gray-150 pt-6">
                    <h4 className="text-sm font-sans font-extrabold text-navy-950 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <ClipboardCheck className="w-5 h-5 text-crimson-600" />
                      Verification Sandbox & Review Status
                    </h4>
                  </div>

                  {/* SUPERVISOR ACTION FEEDBACK PANEL */}
                  {activeTopicSubmission && activeTopicSubmission.status !== 'pending' && (
                    <div className={`p-6 rounded-2xl border-2 text-xs shadow-sm space-y-3 ${
                      activeTopicSubmission.status === 'approved' 
                        ? 'bg-green-50/50 border-green-200 text-green-950' 
                        : 'bg-red-50/50 border-red-200 text-red-950'
                    }`} id="graded-competence-feedback-panel">
                      <div className="flex items-center justify-between border-b border-gray-200/50 pb-2">
                        <h5 className="font-sans font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-sm">
                          <CheckCircle className={`w-5 h-5 ${activeTopicSubmission.status === 'approved' ? 'text-green-600' : 'text-red-600'}`} />
                          Senior Supervisor Evaluation & Response
                        </h5>
                        <span className={`font-mono text-xs font-extrabold px-3 py-0.5 rounded ${
                          activeTopicSubmission.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          SCORE: {activeTopicSubmission.score}/100
                        </span>
                      </div>
                      
                      <div className="space-y-1 font-sans">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-500 block">Feedback Remarks:</span>
                        <p className="italic leading-relaxed text-sm">
                          "{activeTopicSubmission.feedback || 'Excellent code representation. Your video validates complete task satisfaction.'}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-[10px] font-mono text-gray-500 pt-2 border-t border-gray-200/50">
                        <span>Assigned Evaluator:</span>
                        <span className="font-bold text-deep-black">{activeTopicSubmission.evaluatedBy || 'Lead Instructor Kenji'}</span>
                        <span>•</span>
                        <span>Date Evaluated:</span>
                        <span className="font-bold text-deep-black">
                          {activeTopicSubmission.evaluatedAt ? new Date(activeTopicSubmission.evaluatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* ACTIVE SUBMISSION FORM PANEL (PENDING REVIEW) */}
                  {activeTopicSubmission && activeTopicSubmission.status === 'pending' ? (
                    <div className="bg-blue-50/50 border border-blue-200 p-6 rounded-2xl text-center space-y-4" id="competence-pending-message-panel">
                      <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <div className="space-y-1.5 max-w-md mx-auto">
                        <h4 className="text-sm font-sans font-bold text-blue-950">Task Verification Under Active Review</h4>
                        <p className="text-xs text-blue-800 leading-relaxed">
                          Your verification resources have been successfully queued. Senior Supervisors are currently auditing your code and documents locally and reviewing your screen recording demo.
                        </p>
                      </div>
                      
                      <div className="bg-white p-5 rounded-xl border border-blue-100 text-xs text-left max-w-2xl mx-auto space-y-4 shadow-sm">
                        {/* Links section */}
                        {((activeTopicSubmission.links && activeTopicSubmission.links.length > 0) || activeTopicSubmission.githubUrl) && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider block">Submitted Reference Links</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {activeTopicSubmission.links && activeTopicSubmission.links.length > 0 ? (
                                activeTopicSubmission.links.map((link, idx) => (
                                  <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 min-w-0">
                                    <span className="text-[9px] font-mono text-gray-500 block truncate font-bold uppercase">{link.description || 'Reference Link'}</span>
                                    <a 
                                      href={link.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="font-mono font-bold text-crimson-600 hover:underline truncate block mt-0.5 flex items-center gap-1 text-[11px]"
                                      title={link.url}
                                    >
                                      {link.url} <ExternalLink className="w-3 h-3 shrink-0" />
                                    </a>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 min-w-0">
                                  <span className="text-[9px] font-mono text-gray-500 block font-bold uppercase">Repository URL</span>
                                  <a 
                                    href={activeTopicSubmission.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-mono font-bold text-crimson-600 hover:underline truncate block mt-0.5 flex items-center gap-1 text-[11px]"
                                    title={activeTopicSubmission.githubUrl}
                                  >
                                    {activeTopicSubmission.githubUrl} <ExternalLink className="w-3 h-3 shrink-0" />
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Files section */}
                        {((activeTopicSubmission.files && activeTopicSubmission.files.length > 0) || activeTopicSubmission.videoDemoUrl) && (
                          <div className="space-y-2 pt-2 border-t border-gray-100">
                            <span className="text-[10px] font-mono text-gray-400 uppercase font-bold tracking-wider block">Submitted Materials (Files / Screen Recordings)</span>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {activeTopicSubmission.files && activeTopicSubmission.files.length > 0 ? (
                                activeTopicSubmission.files.map((file, idx) => (
                                  <div key={idx} className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2.5 min-w-0">
                                    {file.type === 'video' ? <FileVideo className="w-4 h-4 text-crimson-600 shrink-0" /> : <FileText className="w-4 h-4 text-blue-600 shrink-0" />}
                                    <div className="min-w-0 flex-1">
                                      <span className="font-sans font-semibold text-deep-black block text-[11px] truncate" title={file.name}>{file.name}</span>
                                      <span className="font-mono text-[9px] text-gray-400 block uppercase font-bold">{file.type} • {file.size}</span>
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 flex items-center gap-2.5 min-w-0">
                                  <FileVideo className="w-4 h-4 text-crimson-600 shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <span className="font-sans font-semibold text-deep-black block text-[11px] truncate" title={activeTopicSubmission.videoDemoUrl}>{activeTopicSubmission.videoDemoUrl}</span>
                                    <span className="font-mono text-[9px] text-gray-400 block uppercase font-bold">Video Link</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : !enrolledCourseIds.includes(currentTrack.id) ? (
                    <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-6 shadow-sm text-center space-y-3" id="verification-locked-panel">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-lg">🔒</div>
                      <h4 className="text-xs font-sans font-extrabold text-amber-900 uppercase tracking-wide">Enrollment Required</h4>
                      <p className="text-xs text-amber-700 max-w-sm mx-auto leading-relaxed">
                        To submit verification assets, uploaded documents, or screen recordings for review and supervisor grading, you must first enroll in this course.
                      </p>
                    </div>
                  ) : (
                    // Display form if not submitted or if revision requested
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6" id="verification-form-container">
                      <div className="border-b border-gray-100 pb-3">
                        <h4 className="text-sm font-sans font-bold text-navy-950 flex items-center gap-1.5">
                          <Send className="w-4 h-4 text-crimson-600" />
                          {activeTopicSubmission && activeTopicSubmission.status === 'rejected' 
                            ? 'Submit Competency Revisions' 
                            : 'Submit Competency Verification Form'}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1">
                          Provide complete developer assets below. Fields marked with * are mandatory.
                        </p>
                      </div>

                      <form onSubmit={handleCompetencySubmit} className="space-y-5">
                        
                        {/* DYNAMIC SUBMISSION LINKS */}
                        <div className="space-y-3" id="dynamic-urls-group">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">
                              Submission URLs *
                            </label>
                            <button
                              type="button"
                              onClick={() => setSubmissionLinks(prev => [...prev, { url: '', description: '' }])}
                              className="text-xs text-crimson-600 hover:text-crimson-700 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              Add Another Link
                            </button>
                          </div>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-none">
                            Provide generic reference links for your supervisor evaluation. No longer limited to GitHub.
                          </p>

                          <div className="space-y-3 pt-1">
                            {submissionLinks.map((link, idx) => (
                              <div key={idx} className="flex flex-col md:flex-row gap-3 bg-gray-50/50 border border-gray-200 p-3 rounded-xl relative" id={`link-row-${idx}`}>
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">URL Link</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <Link className="w-3.5 h-3.5 text-gray-400" />
                                    </div>
                                    <input 
                                      type="url"
                                      placeholder="https://..."
                                      value={link.url}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        setSubmissionLinks(prev => prev.map((item, i) => i === idx ? { ...item, url: val } : item));
                                      }}
                                      className="w-full bg-white border border-gray-300 rounded-lg pl-9 p-2 text-xs text-deep-black focus:border-crimson-500 focus:outline-none font-mono"
                                      required={idx === 0}
                                    />
                                  </div>
                                </div>
                                <div className="flex-1 space-y-1">
                                  <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">Description</label>
                                  <input 
                                    type="text"
                                    placeholder="e.g. Code repo, live app, swagger docs"
                                    value={link.description}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setSubmissionLinks(prev => prev.map((item, i) => i === idx ? { ...item, description: val } : item));
                                    }}
                                    className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-deep-black focus:border-crimson-500 focus:outline-none font-sans font-medium"
                                    required={idx === 0}
                                  />
                                </div>
                                {submissionLinks.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => setSubmissionLinks(prev => prev.filter((_, i) => i !== idx))}
                                    className="self-end md:self-center p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                    title="Remove this URL row"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* ATTACHMENTS SECTION */}
                        <div className="space-y-3 pt-2">
                          <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">
                            Documents & Screen Recording Videos *
                          </label>
                          <p className="text-[11px] text-gray-400 font-sans mt-0.5 leading-tight">
                            Verify your task requirements by attaching documentation (e.g. PDF briefs, design logs, ZIP files) and screen recordings demonstrating execution.
                          </p>

                          {/* LIST OF UPLOADED FILES */}
                          {uploadedFiles.length > 0 && (
                            <div className="bg-gray-50/70 rounded-xl p-3 border border-gray-200/50 space-y-2">
                              <span className="text-[9px] font-mono text-gray-400 uppercase font-bold tracking-wider block">Currently Attached Materials ({uploadedFiles.length})</span>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {uploadedFiles.map((file, idx) => (
                                  <div key={idx} className="bg-white p-2.5 rounded-lg border border-gray-100 flex items-center justify-between gap-3 shadow-sm">
                                    <div className="flex items-center gap-2 min-w-0">
                                      {file.type === 'video' ? (
                                        <FileVideo className="w-4 h-4 text-crimson-600 shrink-0" />
                                      ) : (
                                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                                      )}
                                      <div className="min-w-0 flex-1">
                                        <span className="font-sans font-semibold text-deep-black text-[11px] block truncate" title={file.name}>{file.name}</span>
                                        <span className="font-mono text-[9px] text-gray-400 block uppercase font-bold">{file.type} • {file.size}</span>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setUploadedFiles(prev => prev.filter((_, i) => i !== idx));
                                        addAuditLog(`Removed attached file "${file.name}".`, 'warning');
                                      }}
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-colors cursor-pointer shrink-0"
                                      title="Remove file"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TWO DUAL UPLOAD BLOCKS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Hidden real file inputs */}
                            <input 
                              type="file" 
                              ref={docInputRef} 
                              className="hidden" 
                              accept=".pdf,.docx,.doc,.zip,.txt,.json" 
                              onChange={handleDocFileChange} 
                            />
                            <input 
                              type="file" 
                              ref={videoInputRef} 
                              className="hidden" 
                              accept="video/*" 
                              onChange={handleVideoFileChange} 
                            />

                            {/* DOCUMENT UPLOAD DROPZONE */}
                            <div 
                              onClick={() => {
                                if (!uploadFileState.uploading) docInputRef.current?.click();
                              }}
                              className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-colors duration-150 flex flex-col items-center justify-center space-y-1.5 h-24 select-none ${
                                uploadFileState.uploading && uploadFileState.fileType === 'document'
                                  ? 'border-blue-300 bg-blue-50/10'
                                  : 'border-gray-300 hover:border-blue-500 bg-gray-50/50 hover:bg-white'
                              }`}
                            >
                              {uploadFileState.uploading && uploadFileState.fileType === 'document' ? (
                                <div className="space-y-1 w-full px-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-blue-700 font-bold">
                                    <span className="truncate">Uploading {uploadFileState.fileName}</span>
                                    <span>{uploadFileState.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full transition-all duration-150" style={{ width: `${uploadFileState.progress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <FileText className="w-5 h-5 text-blue-500" />
                                  <p className="text-[11px] font-sans text-gray-700 font-bold">Upload Document Asset</p>
                                  <span className="text-[9px] text-gray-400 font-mono">PDF, ZIP, DOCX, TXT up to 50MB</span>
                                </>
                              )}
                            </div>

                            {/* VIDEO UPLOAD DROPZONE */}
                            <div 
                              onClick={() => {
                                if (!uploadFileState.uploading) videoInputRef.current?.click();
                              }}
                              className={`border-2 border-dashed p-4 rounded-xl text-center cursor-pointer transition-colors duration-150 flex flex-col items-center justify-center space-y-1.5 h-24 select-none ${
                                uploadFileState.uploading && uploadFileState.fileType === 'video'
                                  ? 'border-crimson-300 bg-crimson-50/10'
                                  : 'border-gray-300 hover:border-crimson-500 bg-gray-50/50 hover:bg-white'
                              }`}
                            >
                              {uploadFileState.uploading && uploadFileState.fileType === 'video' ? (
                                <div className="space-y-1 w-full px-2">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-crimson-700 font-bold">
                                    <span className="truncate">Uploading {uploadFileState.fileName}</span>
                                    <span>{uploadFileState.progress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-crimson-500 h-full transition-all duration-150" style={{ width: `${uploadFileState.progress}%` }} />
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <FileVideo className="w-5 h-5 text-crimson-500" />
                                  <p className="text-[11px] font-sans text-gray-700 font-bold">Upload Demo Video</p>
                                  <span className="text-[9px] text-gray-400 font-mono">MP4, MOV screen demo up to 50MB</span>
                                </>
                              )}
                            </div>

                          </div>

                          {/* Video Demo Link Alternate */}
                          <div className="bg-gray-50/30 border border-gray-200 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex-1 space-y-1">
                              <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                                OR Paste Loom / YouTube Link
                              </label>
                              <input 
                                type="url"
                                placeholder="https://loom.com/share/..."
                                value={screenRecordingUrl}
                                onChange={(e) => setScreenRecordingUrl(e.target.value)}
                                className="w-full bg-white border border-gray-300 rounded-lg p-2 text-xs text-deep-black focus:border-crimson-500 focus:outline-none font-mono"
                              />
                            </div>
                            <span className="text-[9px] text-gray-400 block font-sans sm:max-w-[200px] leading-snug">
                              Ideal if you host your screen recordings on Loom, Drive, or YouTube.
                            </span>
                          </div>

                        </div>

                        {/* Brief Notes */}
                        <div className="space-y-1">
                          <label className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider block">
                            Brief Verification Notes & System Constraints
                          </label>
                          <textarea 
                            rows={3}
                            placeholder="Detail compile flags, board layout instructions, schema setup commands, or core features shown in the recording..."
                            value={competenceText}
                            onChange={(e) => setCompetenceText(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs text-deep-black focus:border-crimson-500 focus:bg-white focus:outline-none font-sans leading-relaxed"
                          />
                        </div>

                        {competenceMessage && (
                          <div className={`p-3 rounded-xl flex items-start gap-2 text-xs border ${
                            competenceMessage.isError 
                              ? 'bg-red-50 text-red-700 border-red-200' 
                              : 'bg-green-50 text-green-700 border-green-200'
                          }`}>
                            <Info className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="font-sans leading-relaxed">{competenceMessage.text}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-3 rounded-xl font-sans font-bold text-xs transition-colors duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-crimson-900/10"
                        >
                          <Send className="w-4 h-4" />
                          {activeTopicSubmission && activeTopicSubmission.status === 'rejected' 
                            ? 'Republish Revision Verification request' 
                            : 'Publish Task Verification request'}
                        </button>

                      </form>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <div className="flex flex-col lg:flex-row gap-8" id="syllabus-two-col-layout">
                
                {/* LEFT COLUMN: Modular syllabus drawer + visual checklist */}
                <div className="w-full lg:w-[380px] shrink-0 space-y-6" id="syllabus-left-column">
                  
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden text-left" id="syllabus-drawer">
                    <div className="bg-navy-950 text-white p-5 border-b border-navy-800">
                      <h4 className="text-sm font-sans font-bold flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-crimson-400" />
                        Syllabus Directory
                      </h4>
                      <p className="text-[10px] text-gray-400 font-sans mt-1">Sequential modules. Expand to stream lectures.</p>
                    </div>

                    <div className="divide-y divide-gray-100" id="syllabus-accordion-container">
                      {currentTrack.modules.map((mod, modIdx) => {
                        const isExpanded = !!expandedModules[mod.id];
                        const unitsCount = mod.topics.length;
                        const completedInMod = mod.topics.filter(t => completedTopics.includes(t.id)).length;
                        
                        return (
                          <div key={mod.id} className="bg-white" id={`accordion-item-${mod.id}`}>
                            {/* Module Header Button */}
                            <button
                              onClick={() => {
                                setExpandedModules(prev => ({
                                  ...prev,
                                  [mod.id]: !prev[mod.id]
                                }));
                              }}
                              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                            >
                              <div className="space-y-1 pr-2">
                                <span className="text-[9px] font-mono font-bold text-crimson-600 uppercase">
                                  Module {modIdx + 1}
                                </span>
                                <h5 className="text-xs font-sans font-bold text-deep-black leading-tight">
                                  {mod.title.replace(`Module ${modIdx + 1}: `, '')}
                                </h5>
                                <span className="text-[10px] text-gray-400 font-sans block">
                                  {mod.topics.length} Units • {completedInMod}/{unitsCount} Done
                                </span>
                              </div>
                              <ChevronDown 
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                                  isExpanded ? 'rotate-180' : ''
                                }`} 
                              />
                            </button>

                            {/* Topics List Under Module */}
                            {isExpanded && (
                              <div className="bg-gray-50/50 border-t border-gray-100 divide-y divide-gray-100" id={`accordion-topics-${mod.id}`}>
                                {mod.topics.map((top, topIdx) => {
                                  const isSelected = activeTopicId === top.id;
                                  const watched = completedTopics.includes(top.id);
                                  
                                  // Find if there's any submission for this topic
                                  const topicSub = submissions.find(
                                    s => s.studentEmail === studentProgress.email && s.topicId === top.id
                                  );

                                  return (
                                    <button
                                      key={top.id}
                                      onClick={() => {
                                        setActiveModuleId(mod.id);
                                        setActiveTopicId(top.id);
                                        if (enrolledCourseIds.includes(activeTrackId)) {
                                          setStartedCourseIds(prev => {
                                            if (!prev.includes(activeTrackId)) return [...prev, activeTrackId];
                                            return prev;
                                          });
                                        }
                                      }}
                                      className={`w-full px-5 py-3 flex items-start gap-3 text-left transition-colors duration-150 cursor-pointer ${
                                        isSelected 
                                          ? 'bg-crimson-50/40 border-l-4 border-crimson-600' 
                                          : 'hover:bg-gray-100/50 border-l-4 border-transparent'
                                      }`}
                                    >
                                      {/* Status bullet icon */}
                                      <div className="mt-0.5 shrink-0">
                                        {topicSub?.status === 'approved' ? (
                                          <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[9px] font-bold">
                                            ✓
                                          </div>
                                        ) : topicSub?.status === 'pending' ? (
                                          <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse flex items-center justify-center text-white text-[9px] font-bold">
                                            ⋯
                                          </div>
                                        ) : topicSub?.status === 'rejected' ? (
                                          <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-white text-[9px] font-bold">
                                            !
                                          </div>
                                        ) : watched ? (
                                          <div className="w-4 h-4 rounded-full bg-green-100 border border-green-300 flex items-center justify-center text-green-700 text-[9px] font-bold">
                                            ✓
                                          </div>
                                        ) : (
                                          <div className="w-4 h-4 rounded-full border border-gray-300 bg-white" />
                                        )}
                                      </div>

                                      <div className="flex-1 min-w-0">
                                        <h6 className={`text-xs font-sans leading-tight ${
                                          isSelected ? 'text-crimson-600 font-bold' : 'text-gray-700 font-medium'
                                        }`}>
                                          Topic {modIdx + 1}.{topIdx + 1}: {top.title.replace(/Topic \d+\.\d+: /, '')}
                                        </h6>
                                        <span className="text-[10px] text-gray-400 font-mono block mt-1 flex items-center gap-1.5">
                                          <Clock className="w-3 h-3" /> {top.duration} mins
                                          {topicSub && (
                                            <span className={`font-mono text-[8px] uppercase font-bold px-1 rounded ${
                                              topicSub.status === 'approved' ? 'bg-green-100 text-green-800' :
                                              topicSub.status === 'pending' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                                            }`}>
                                              {topicSub.status}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}

                                {/* Module Chapter Quiz & Assessment button */}
                                {mod.quizEnabled !== false && (
                                  <div className="p-3 bg-gray-50 border-t border-gray-100 text-left">
                                    {completedQuizzes[mod.id] ? (
                                      <button
                                        onClick={() => handleSelectQuiz(mod.id)}
                                        className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between text-[11px] transition-all cursor-pointer ${
                                          completedQuizzes[mod.id].status === 'graded' 
                                            ? 'bg-green-50 border-green-200 text-green-900' 
                                            : 'bg-blue-50 border-blue-200 text-blue-900 animate-pulse'
                                        }`}
                                      >
                                        <span className="font-sans font-bold flex items-center gap-1.5">
                                          <Award className="w-3.5 h-3.5 text-crimson-600" />
                                          {completedQuizzes[mod.id].status === 'graded' ? 'Chapter Quiz: Passed' : 'Chapter Quiz: Pending Review'}
                                        </span>
                                        <span className="font-mono text-[10px] font-bold">
                                          {completedQuizzes[mod.id].status === 'graded' 
                                            ? `${completedQuizzes[mod.id].objectiveScore}/${completedQuizzes[mod.id].objectiveTotal} MC • Graded`
                                            : 'Pending'
                                          }
                                        </span>
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => handleSelectQuiz(mod.id)}
                                        className="w-full py-2.5 px-3 bg-navy-950 hover:bg-navy-900 text-white rounded-lg flex items-center justify-between text-[11px] font-sans font-bold transition-all cursor-pointer shadow-sm"
                                      >
                                        <span className="flex items-center gap-1.5">
                                          <CheckSquare className="w-3.5 h-3.5 text-crimson-400" />
                                          Take Chapter Quiz
                                        </span>
                                        <span className="bg-crimson-600 px-1.5 py-0.5 rounded text-[8px] font-mono text-white">
                                          +20 Pts
                                        </span>
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* OVERALL COURSE FINAL ASSESSMENT CARD */}
                  {currentTrack.examEnabled !== false && (
                    <div className="bg-gradient-to-br from-navy-900 to-navy-950 text-white rounded-2xl border border-navy-800 p-5 shadow-lg text-left space-y-4 mt-6" id="course-final-assessment-banner">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[9px] font-mono font-bold text-crimson-400 uppercase tracking-widest block">
                            Flagship Track Milestone
                          </span>
                          <h4 className="text-sm font-sans font-extrabold tracking-tight">
                            Course Certification Exam
                          </h4>
                          <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
                            Test cumulative knowledge across Beginner, Intermediate, Advanced, and Expert modules in this track.
                          </p>
                        </div>
                        <Trophy className="w-5 h-5 text-crimson-400 shrink-0" />
                      </div>

                      {completedOverallAssessments[activeTrackId] ? (
                        <div className="space-y-3">
                          <div className={`p-3 rounded-xl border text-[11px] flex items-center justify-between ${
                            completedOverallAssessments[activeTrackId].status === 'graded'
                              ? 'bg-green-950/50 border-green-800 text-green-200'
                              : 'bg-blue-950/50 border-blue-800 text-blue-200 animate-pulse'
                          }`}>
                            <span className="font-sans font-bold flex items-center gap-1.5">
                              <Award className="w-4 h-4 text-crimson-400" />
                              {completedOverallAssessments[activeTrackId].status === 'graded' ? 'Final Exam Approved' : 'Final Exam Under Review'}
                            </span>
                            <span className="font-mono text-[9px] font-bold">
                              {completedOverallAssessments[activeTrackId].status === 'graded'
                                ? `${completedOverallAssessments[activeTrackId].objectiveScore}/${completedOverallAssessments[activeTrackId].objectiveTotal} MC • Passed`
                                : 'Pending'
                              }
                            </span>
                          </div>
                          <button
                            onClick={handleSelectOverallAssessment}
                            className="w-full py-2 bg-navy-850 hover:bg-navy-800 text-white border border-navy-700 rounded-lg text-[11px] font-sans font-bold transition-all cursor-pointer text-center block"
                          >
                            Review Submission & Results
                          </button>
                        </div>
                      ) : !enrolledCourseIds.includes(currentTrack.id) ? (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center space-y-2">
                          <p className="text-[11px] text-gray-500 leading-normal">
                            🔒 Enroll in this course to unlock the final course certification assessment.
                          </p>
                          <button
                            onClick={() => handleEnrollCourse(currentTrack.id, currentTrack.title)}
                            className="w-full bg-crimson-600/10 hover:bg-crimson-600/20 text-crimson-700 py-1.5 rounded-lg text-xs font-sans font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <span>Enroll in Course</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={handleSelectOverallAssessment}
                          className="w-full bg-crimson-600 hover:bg-crimson-700 text-white py-2.5 rounded-xl text-xs font-sans font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" /> Take Final Course Assessment (+50 Pts)
                        </button>
                      )}
                    </div>
                  )}

                </div>

                {/* RIGHT COLUMN: Interactive Lecture Video Player & Competency Submissions Form */}
                <div className="flex-1 space-y-6 text-left" id="syllabus-right-column">
                  {assessmentActive ? (
                    renderAssessmentWorkstation()
                  ) : (
                    <>
                      {/* Topic Title card */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-2">
                        <span className="text-[9px] font-mono font-bold text-crimson-600 uppercase tracking-widest block">
                          Currently Streaming Unit
                        </span>
                        <h3 className="text-lg font-sans font-extrabold text-deep-black tracking-tight leading-none">
                          {currentTopic?.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium">
                          Watch the complete instructional briefing below, review the required engineering tools, and upload your task demonstration code and video.
                        </p>
                      </div>

                      {/* PREMIUM HTML5 VIDEO PLAYER MOCK */}
                      <div className="bg-navy-950 rounded-2xl overflow-hidden shadow-lg border border-navy-800 relative flex flex-col justify-between" id="instructional-video-player-container">
                        
                        {/* Video Visualizer Canvas/Screen */}
                        <div className="aspect-video bg-gradient-to-b from-navy-900 to-navy-950 relative flex flex-col justify-between p-6 overflow-hidden animate-fadeIn" id="video-screen-viewport">
                          {/* Header bar overlay */}
                          <div className="flex items-center justify-between text-xs font-mono text-gray-400 relative z-10" id="video-screen-header">
                            <span className="bg-navy-800/80 px-2.5 py-1 rounded border border-navy-700/50 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                              <span className={`w-2 h-2 rounded-full ${videoPlaying ? 'bg-red-500 animate-ping' : 'bg-gray-400'}`} />
                              {videoPlaying ? 'STREAMING LECTURE' : 'PAUSED'}
                            </span>
                            <span className="bg-navy-800/80 px-2 py-1 rounded border border-navy-700/50 text-[10px]">
                              {playbackSpeed}x SPEED
                            </span>
                          </div>

                          {/* Subtitles Overlay and Play states overlay */}
                          <div className="flex-1 flex flex-col justify-center items-center relative z-10 my-4">
                            {!videoPlaying && videoTime === 0 && (
                              <button 
                                onClick={() => setVideoPlaying(true)}
                                className="w-16 h-16 rounded-full bg-crimson-600 hover:bg-crimson-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                id="video-screen-play-cta"
                              >
                                <Play className="w-8 h-8 fill-white ml-1" />
                              </button>
                            )}

                            {/* Interactive live audio waveforms when playing */}
                            {videoPlaying && (
                              <div className="flex items-end gap-1 h-12 mb-4 opacity-40">
                                {Array.from({ length: 12 }).map((_, i) => (
                                  <div 
                                    key={i} 
                                    className="bg-crimson-500 w-1.5 rounded-full"
                                    style={{ 
                                      height: `${20 + Math.sin(videoTime + i) * 60}%`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                            
                            {/* Veritable Subtitle Line Overlay */}
                            <div className="max-w-xl text-center bg-black/70 border border-white/10 text-white px-5 py-3 rounded-xl text-sm font-sans tracking-wide leading-relaxed font-medium shadow-xl mt-auto animate-fadeIn select-none" id="video-subtitles-overlay">
                              <span className="text-yellow-400 font-mono text-[9px] block uppercase tracking-widest mb-1 opacity-60">
                                Interactive Transcript Subtitles
                              </span>
                              "{activeSubtitle?.text || 'No speech recorded.'}"
                            </div>
                          </div>

                          {/* Controls Bottom Overlay */}
                          <div className="bg-black/40 p-4 rounded-xl border border-white/10 flex flex-col gap-3 relative z-10" id="video-controls-overlay">
                            {/* Scrubber Timeline track */}
                            <div className="flex items-center gap-3">
                              <input 
                                type="range"
                                min={0}
                                max={maxSecs}
                                value={videoTime}
                                onChange={(e) => setVideoTime(Number(e.target.value))}
                                className="flex-1 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-crimson-600 focus:outline-none"
                                id="video-scrubber"
                              />
                            </div>

                            {/* Control actions */}
                            <div className="flex items-center justify-between text-white" id="video-controls-actions">
                              <div className="flex items-center gap-4">
                                <button
                                  onClick={() => setVideoPlaying(!videoPlaying)}
                                  className="hover:text-crimson-400 transition-colors cursor-pointer"
                                  id="video-play-btn"
                                  title={videoPlaying ? 'Pause' : 'Play'}
                                >
                                  {videoPlaying ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                                </button>
                                <button
                                  onClick={() => setVideoTime(0)}
                                  className="hover:text-crimson-400 transition-colors cursor-pointer"
                                  id="video-reset-btn"
                                  title="Restart Video"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                
                                <span className="text-[11px] font-mono text-gray-300">
                                  {formatVideoTime(videoTime)} / {currentTopic?.duration}
                                </span>
                              </div>

                              <div className="flex items-center gap-3" id="video-controls-right">
                                {/* Playback speed selector */}
                                <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded border border-white/10" id="video-speed-selector">
                                  {[1, 1.25, 1.5, 2].map((speed) => (
                                    <button
                                      key={speed}
                                      onClick={() => setPlaybackSpeed(speed)}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer ${
                                        playbackSpeed === speed ? 'bg-crimson-600 text-white' : 'text-gray-400 hover:text-white'
                                      }`}
                                    >
                                      {speed}x
                                    </button>
                                  ))}
                                </div>

                                {/* Mute toggle button */}
                                <button 
                                  onClick={() => setIsMuted(!isMuted)}
                                  className="hover:text-crimson-400 transition-colors cursor-pointer"
                                  id="video-mute-btn"
                                >
                                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>

                        {/* SUBTITLES TRANSCRIPT LIST */}
                        <div className="bg-navy-900 border-t border-navy-800 p-5 text-left space-y-3" id="video-transcript-box">
                          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
                            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                              <BookOpen className="w-3.5 h-3.5 text-crimson-500" /> Topic Transcription
                            </span>
                            <span className="text-[9px] font-sans text-gray-500">Click time indicator to jump player</span>
                          </div>
                          <div className="max-h-[140px] overflow-y-auto space-y-2 pr-2" id="transcript-scroller">
                            {(currentTopic?.subtitles || []).map((sub, sIdx) => {
                              const isActive = activeSubtitle?.time === sub.time;
                              return (
                                <button
                                  key={sIdx}
                                  onClick={() => {
                                    setVideoTime(sub.time);
                                    setVideoPlaying(true);
                                  }}
                                  className={`w-full text-left p-2 rounded-lg text-xs transition-all duration-150 flex items-start gap-3 cursor-pointer ${
                                    isActive 
                                      ? 'bg-crimson-600/10 text-crimson-400 font-semibold border border-crimson-500/20' 
                                      : 'hover:bg-navy-850/50 text-gray-300'
                                  }`}
                                >
                                  <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded ${
                                    isActive ? 'bg-crimson-600 text-white' : 'bg-navy-800 text-gray-400'
                                  }`}>
                                    {formatVideoTime(sub.time)}
                                  </span>
                                  <span className="font-sans leading-relaxed flex-1">{sub.text}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                      {/* ACTIVE TOPIC DESC & REQUIRED TOOLS PILLS */}
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm text-left space-y-4">
                        <div className="space-y-1">
                          <h4 className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
                            Briefing & Operational Protocol
                          </h4>
                          <p className="text-xs text-gray-700 leading-relaxed font-sans">{currentTopic?.description}</p>
                        </div>

                        {currentTopic?.tools && currentTopic.tools.length > 0 && (
                          <div className="border-t border-gray-100 pt-3 space-y-2">
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
                              Required Stack & Instruments
                            </span>
                            <div className="flex flex-wrap gap-2" id="required-tools-badges">
                              {currentTopic.tools.map((tool, tIdx) => (
                                <span 
                                  key={tIdx} 
                                  className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-700 border border-gray-200 px-3 py-1 rounded-full text-[11px] font-sans font-medium"
                                >
                                  <Code className="w-3.5 h-3.5 text-crimson-600" />
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Integrated Verification & Submission sandbox */}
                      {renderVerificationWorkspace()}
                    </>
                  )}
                </div>

              </div>
            );
          })()}

        </div>
      )}

          {/* PRACTICE SANDBOX TAB REMOVED */}

          {/* MY CERTIFICATIONS TAB */}
          {activeTab === 'student-certifications' && (
        <div className="space-y-8" id="tab-student-certifications">
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5" id="certifications-header">
            <div className="space-y-1">
              <h3 className="text-lg font-sans font-bold text-deep-black">My Cryptographically Secured Certifications</h3>
              <p className="text-xs text-gray-500">
                Each proficiency level you complete triggers a cryptographic signature and registers a verifiable SHA-256 hash onto our public Dojo ledger. Present these credentials to institutional verifiers for instant audit checks.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveTab('student-overview');
                addAuditLog("Returned to Student Home Page.", 'info');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-navy-950 border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer self-start sm:self-auto shrink-0"
              id="certs-back-to-home-btn"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
              <span>Back to Home Page</span>
            </button>
          </div>

          {myCerts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center space-y-4" id="certs-empty-view">
              <Award className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm font-sans font-semibold text-gray-600">No active certifications signed-off yet.</p>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Complete modules and submit your Intermediate Level project to have our senior evaluators evaluate, grade, and cryptographically register your first credential!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" id="certs-cards-list">
              {myCerts.map((cert) => {
                return (
                  <div 
                    key={cert.id} 
                    className="bg-white rounded-2xl border-2 border-crimson-600 shadow-lg overflow-hidden flex flex-col justify-between"
                    id={`credential-card-${cert.id}`}
                  >
                    {/* Header bar */}
                    <div className="bg-navy-950 text-white p-6 border-b border-navy-800 flex items-center justify-between" id={`credential-header-${cert.id}`}>
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono uppercase tracking-widest text-crimson-400 font-bold">
                          Official Verifiable Credential
                        </span>
                        <h4 className="text-base font-sans font-bold text-white tracking-tight leading-none">
                          DOJO HUB ACADEMY
                        </h4>
                      </div>
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        cert.level === 'Beginner' ? 'bg-gray-100 text-gray-800 border border-gray-300' :
                        cert.level === 'Intermediate' ? 'bg-yellow-400 text-yellow-900' :
                        cert.level === 'Advanced' ? 'bg-green-500 text-white' : 'bg-black text-white'
                      }`}>
                        🏆
                      </span>
                    </div>

                    {/* Certificate Body */}
                    <div className="p-6 text-center space-y-6" id={`credential-body-${cert.id}`}>
                      <div className="space-y-1" id={`credential-recipient-${cert.id}`}>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">This certifies that</span>
                        <h5 className="text-xl font-sans font-extrabold text-deep-black uppercase tracking-tight">
                          {cert.studentName}
                        </h5>
                        <p className="text-xs text-gray-500 font-mono mt-0.5">{cert.studentEmail}</p>
                      </div>

                      <div className="space-y-1" id={`credential-achievement-${cert.id}`}>
                        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">has fully achieved proficiency in</span>
                        <h6 className="text-lg font-sans font-bold text-crimson-600 uppercase">
                          {getFullLevelName(cert.level)}
                        </h6>
                        <h5 className="text-xs font-sans font-bold text-gray-600 uppercase">
                          Discipline: {cert.level === 'Beginner' ? 'Frontend & Hardware Foundations' : cert.level === 'Intermediate' ? 'Advanced Client Architectures & Firmware' : cert.level === 'Advanced' ? 'Fullstack Engineering & Connected Systems' : 'Enterprise Architecture, AI & Security Capstone'}
                        </h5>
                        <span className="text-[10px] text-gray-400 block font-sans">
                          Issued on {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Mock QR and seal */}
                      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100" id={`credential-security-${cert.id}`}>
                        <div className="text-left space-y-1.5 flex-1 pr-4" id={`credential-signatures-${cert.id}`}>
                          <div className="text-[9px] font-mono text-gray-400 uppercase leading-none">Cryptographic Hash</div>
                          <div className="text-[9px] font-mono text-gray-600 truncate max-w-[200px]" title={cert.hash}>
                            {cert.hash}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 border-t border-gray-200/50 pt-1.5" id={`credential-signers-${cert.id}`}>
                            <div>
                              <div className="text-[8px] font-mono text-gray-400 uppercase leading-none">Evaluator Sign</div>
                              <div className="text-[9px] font-sans font-semibold text-deep-black mt-0.5 italic">
                                ✓ {cert.signatures.evaluator || 'Lead Instructor Kenji'}
                              </div>
                            </div>
                            <div>
                              <div className="text-[8px] font-mono text-gray-400 uppercase leading-none">Admin Sign</div>
                              <div className="text-[9px] font-sans font-semibold text-deep-black mt-0.5 italic">
                                ✓ {cert.signatures.admin || 'System Admin'}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* QR Code Placeholder */}
                        <div className="w-14 h-14 bg-white p-1 border border-gray-200 rounded flex flex-col justify-between" id={`credential-qr-${cert.id}`}>
                          <div className="grid grid-cols-5 gap-0.5 flex-1" id="mock-qr-dots">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-full h-full ${
                                  (i % 3 === 0 || i % 4 === 1 || i < 5 || i > 20 || i % 7 === 2) 
                                    ? 'bg-deep-black' 
                                    : 'bg-white'
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[7px] font-mono text-gray-400 text-center uppercase tracking-widest mt-1">Verified</span>
                        </div>
                      </div>

                    </div>

                    {/* Footer Attestation Button */}
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between text-xs" id={`credential-footer-${cert.id}`}>
                      <span className="font-mono text-[10px] text-gray-400 font-bold uppercase flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" /> Registry Verified
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedCertForModal(cert)}
                          className="bg-crimson-600 hover:bg-crimson-700 text-white font-sans font-bold px-3 py-1.5 rounded text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          Print Certificate
                        </button>
                        <button
                          onClick={() => {
                            addAuditLog(`Copied share link for credential ${cert.id}.`, "info");
                            alert(`Verification Link copied:\n${window.location.origin}/verify/${cert.hash}`);
                          }}
                          className="text-crimson-600 font-sans font-semibold hover:text-crimson-700 flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          Share
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* Embedded High-Fidelity Certificate View Modal */}
      {selectedCertForModal && (
        <CertificateModal
          isOpen={!!selectedCertForModal}
          onClose={() => setSelectedCertForModal(null)}
          credential={selectedCertForModal}
        />
      )}

    </div>
  );
}
