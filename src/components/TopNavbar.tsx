import React, { useState, useRef, useEffect } from 'react';
import { UserRole, StudentProgress } from '../types';
import { 
  ShieldCheck, 
  User, 
  GraduationCap, 
  Sparkles, 
  Clock, 
  LogOut,
  Settings,
  HelpCircle,
  ChevronDown,
  Mail,
  Award,
  BookOpen,
  Trophy,
  CheckCircle,
  Sliders,
  LifeBuoy
} from 'lucide-react';

interface TopNavbarProps {
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  studentProgress: StudentProgress;
  setStudentProgress: React.Dispatch<React.SetStateAction<StudentProgress>>;
  currentUser: { name: string; email: string; role: UserRole };
  onSignOut: () => void;
}

export default function TopNavbar({
  activeRole,
  setActiveRole,
  studentProgress,
  setStudentProgress,
  currentUser,
  onSignOut
}: TopNavbarProps) {
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states for profile editing
  const [editingName, setEditingName] = useState(studentProgress.name);
  const [editingEmail, setEditingEmail] = useState(studentProgress.email || 'alex.mercer@dojo.edu');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update form inputs when studentProgress changes
  useEffect(() => {
    setEditingName(studentProgress.name);
    if (studentProgress.email) {
      setEditingEmail(studentProgress.email);
    }
  }, [studentProgress]);

  // Show a toast message
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Define metadata per role
  const currentProfile = {
    name: currentUser?.name || studentProgress.name,
    email: currentUser?.email || studentProgress.email || 'alex.mercer@dojo.edu',
    status: activeRole === 'admin' 
      ? 'Platform Superuser' 
      : activeRole === 'evaluator' 
        ? 'Senior Certification Supervisor' 
        : 'Intermediate Level Candidate',
    avatarColor: activeRole === 'admin' 
      ? 'bg-red-600' 
      : activeRole === 'evaluator' 
        ? 'bg-indigo-600' 
        : 'bg-yellow-500'
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setStudentProgress(prev => ({
      ...prev,
      name: editingName,
      email: editingEmail
    }));
    setShowSettingsModal(false);
    setProfileDropdownOpen(false);
    triggerToast("Profile details updated successfully!");
  };

  const handleSignOut = () => {
    triggerToast("Signing out of secure session...");
    setProfileDropdownOpen(false);
    setTimeout(() => {
      onSignOut();
    }, 1000);
  };

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm" id="top-navbar-container">
      {/* Search / Context Status */}
      <div className="flex items-center gap-4" id="navbar-left">
        <div>
          <h2 className="text-xl font-sans font-bold text-deep-black tracking-tight" id="navbar-view-title">
            {activeRole === 'student' && 'Student Learning Center'}
            {activeRole === 'admin' && 'Platform Governance Panel'}
            {activeRole === 'evaluator' && 'Supervisor & Grading Sandbox'}
          </h2>
          <p className="text-xs text-gray-500 font-sans" id="navbar-view-subtitle">
            Dojo Hub Certifications • Secure Client Terminal
          </p>
        </div>
      </div>

      {/* Role Switcher & Interactive Profile Menu (Right Side) */}
      <div className="flex items-center gap-6" id="navbar-right">

        {/* Interactive User Profile display with LinkedIn-style Dropdown */}
        <div className="relative" ref={dropdownRef} id="user-profile-wrapper">
          <button 
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-3 text-left focus:outline-none hover:bg-gray-50 p-1.5 rounded-xl transition-all cursor-pointer"
            id="user-profile-display-button"
            aria-haspopup="true"
            aria-expanded={profileDropdownOpen}
          >
            <div className="relative" id="user-avatar-container">
              <div className={`w-10 h-10 rounded-full ${currentProfile.avatarColor} text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm border border-white`} id="user-avatar">
                {currentProfile.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" id="user-online-dot"></span>
            </div>
            <div className="hidden lg:block pr-1 leading-none animate-fadeIn" id="user-info-text">
              <p className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-wider leading-none" id="user-info-status">
                {currentProfile.status}
              </p>
              <div className="flex items-center gap-1 mt-0.5" id="user-info-name-row">
                <h4 className="text-xs font-sans font-bold text-deep-black leading-none" id="user-info-name">
                  {currentProfile.name}
                </h4>
                <ChevronDown className="w-3 h-3 text-gray-500 animate-pulse" />
              </div>
            </div>
          </button>

          {/* LinkedIn-style "Me" Dropdown Menu (Aligned Right) */}
          {profileDropdownOpen && (
            <div 
              className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden divide-y divide-gray-100 animate-slideUp text-left"
              id="profile-dropdown-menu"
            >
              {/* Header profile preview */}
              <div className="p-4 flex gap-3 items-center bg-gray-50/50" id="dropdown-profile-header">
                <div className={`w-12 h-12 rounded-full ${currentProfile.avatarColor} text-white flex items-center justify-center font-bold text-base border border-gray-200 shadow-sm`} id="dropdown-profile-avatar">
                  {currentProfile.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0" id="dropdown-profile-text">
                  <h5 className="text-sm font-sans font-bold text-navy-950 truncate">{currentProfile.name}</h5>
                  <p className="text-[11px] text-gray-500 truncate">{currentProfile.email}</p>
                  <span className="inline-block bg-yellow-50 text-yellow-800 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded mt-1 border border-yellow-200/50">
                    {currentProfile.status}
                  </span>
                </div>
              </div>


              {/* Navigation Actions */}
              <div className="py-1" id="dropdown-action-links">
                <button
                  onClick={() => {
                    setShowSettingsModal(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-100 hover:text-navy-950 font-sans font-medium transition-colors text-left"
                  id="dropdown-link-settings"
                >
                  <Settings className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="block font-bold">Settings & Preferences</span>
                    <span className="text-[10px] text-gray-400 font-normal">Edit display name, avatar, and credentials</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowHelpModal(true);
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-100 hover:text-navy-950 font-sans font-medium transition-colors text-left"
                  id="dropdown-link-help"
                >
                  <HelpCircle className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="block font-bold">Get Help & Support</span>
                    <span className="text-[10px] text-gray-400 font-normal">View platform guide, FAQs, and assistance</span>
                  </div>
                </button>
              </div>

              {/* Sign Out Action */}
              <div className="py-1 bg-red-50/20" id="dropdown-signout-wrapper">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs text-crimson-600 hover:bg-crimson-50 font-sans font-bold transition-colors text-left"
                  id="dropdown-link-signout"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign out of secure session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. SETTINGS & PROFILE EDITING MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="settings-profile-modal">
          <div className="bg-white rounded-2xl max-w-md w-full border border-gray-200 shadow-2xl p-6 text-left space-y-6 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-sans font-extrabold text-navy-950 tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-crimson-600" /> Profile Settings
                </h3>
                <p className="text-xs text-gray-500">Edit secure client identification records.</p>
              </div>
              <button 
                onClick={() => setShowSettingsModal(false)}
                className="text-gray-400 hover:text-navy-950 text-sm font-bold p-1 hover:bg-gray-100 rounded-lg"
                id="close-settings-modal-btn"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 block">Student Display Name</label>
                <input
                  type="text"
                  required
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  placeholder="e.g. Diana Nalule"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 block">Dojo Email Address</label>
                <input
                  type="email"
                  required
                  value={editingEmail}
                  onChange={(e) => setEditingEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm font-sans focus:outline-none focus:ring-2 focus:ring-crimson-500"
                  placeholder="e.g. diana.nalule@dojo.org"
                />
              </div>

              {activeRole === 'student' && (
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-gray-400 block">Learning Sandbox Status</span>
                  <div className="text-xs">
                    <div>
                      <span className="text-gray-500 block">Current Level:</span>
                      <span className="font-bold text-navy-950 text-sm">Intermediate Candidate</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-sans font-bold rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-sans font-bold rounded-xl text-sm transition-colors shadow-md"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. HELP & RESOURCES FAQ MODAL */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-navy-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" id="help-resources-modal">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-gray-200 shadow-2xl p-6 text-left space-y-6 animate-scaleUp">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-crimson-600 animate-spin" />
                <div>
                  <h3 className="text-lg font-sans font-extrabold text-navy-950 tracking-tight">
                    Get Help & Support Center
                  </h3>
                  <p className="text-xs text-gray-500">Dojo Hub platform handbook, guides, and assistance.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowHelpModal(false)}
                className="text-gray-400 hover:text-navy-950 text-sm font-bold p-1 hover:bg-gray-100 rounded-lg"
                id="close-help-modal-btn"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2" id="faq-accordion-list">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                <h5 className="text-xs font-sans font-bold text-navy-950">Q: How do I earn certification points on this platform?</h5>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  Points are credited for complete syllabus interaction! Each completed topic unit adds 10 points. Successfully passing module-level quizzes adds 50 points. Submitting a final video project and receiving a supervisor passing grade unlocks capstone bonus points.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                <h5 className="text-xs font-sans font-bold text-navy-950">Q: How do I access my courses that are in progress?</h5>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  You can see your top courses on your updated <strong>Home</strong> page. Access all your courses in progress in the dedicated <strong>My Learning</strong> directory on the navigation sidebar. Click <strong>Resume course</strong> to jump right into the video player.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                <h5 className="text-xs font-sans font-bold text-navy-950">Q: How are manual projects graded?</h5>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  When you submit your practical task project (via the "Submit Task" link), your records are dispatched to senior engineering instructors. You can instantly simulate manual supervisor grading by clicking "Simulate Manual Supervisor Grade" inside your task status panel.
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/50">
                <h5 className="text-xs font-sans font-bold text-navy-950">Q: What is the "Supervisor & Grading Sandbox" role switcher?</h5>
                <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">
                  This platform simulates both ends of learning! Switch your role to "Supervisor" at the top bar to inspect submitted project videos, write grades/constructive reviews, and dispatch evaluation reports back to students in real-time.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="w-full py-2.5 bg-navy-950 hover:bg-navy-900 text-white font-sans font-bold rounded-xl text-sm transition-colors text-center"
              >
                Close Handbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating System Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-navy-950 text-white px-5 py-3 rounded-xl border border-navy-800 shadow-2xl flex items-center gap-3 z-50 animate-slideUp text-xs font-sans font-semibold">
          <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}
    </header>
  );
}
