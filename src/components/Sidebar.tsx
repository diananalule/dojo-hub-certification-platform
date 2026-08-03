import React from 'react';
import { UserRole } from '../types';
import DojoHubLogo from './DojoHubLogo';
import { 
  Award, 
  Shield, 
  BookOpen, 
  Users, 
  Terminal, 
  ClipboardCheck, 
  History, 
  Search, 
  Activity, 
  Calendar,
  Layers,
  GraduationCap,
  Home
} from 'lucide-react';

interface NavItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  badge?: string;
  badgeType?: 'crimson' | 'default';
}

interface SidebarProps {
  activeRole: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  pendingSubmissionsCount: number;
  totalCredentialsCount: number;
}

export default function Sidebar({
  activeRole,
  activeTab,
  setActiveTab,
  pendingSubmissionsCount,
  totalCredentialsCount
}: SidebarProps) {
  
  // Navigation tabs definition by role
  const navigationItems: Record<UserRole, NavItem[]> = {
    student: [
      { id: 'student-overview', name: 'Home', icon: Home },
      { id: 'student-learning', name: 'My Learning', icon: BookOpen },
      { id: 'student-certifications', name: 'My Certificates', icon: Award }
    ],
    admin: [
      { id: 'admin-metrics', name: 'Platform Metrics', icon: Activity },
      { id: 'admin-users', name: 'User Directory', icon: Users },
      { id: 'admin-paths', name: 'Curriculum Builder', icon: Layers }
    ],
    evaluator: [
      { 
        id: 'evaluator-queue', 
        name: 'Grading Queue', 
        icon: ClipboardCheck, 
        badge: pendingSubmissionsCount > 0 ? `${pendingSubmissionsCount} pending` : undefined,
        badgeType: 'crimson'
      },
      { id: 'evaluator-analytics', name: 'Student Insights', icon: Activity }
    ]
  };

  const currentItems = navigationItems[activeRole] || [];

  return (
    <aside className="w-64 bg-navy-950 text-white flex flex-col fixed top-0 bottom-0 left-0 z-20 border-r border-navy-800 shadow-xl" id="sidebar-container">
      {/* Branding Header */}
      <div className="p-5 border-b border-navy-800 flex items-center gap-3 bg-navy-950" id="sidebar-branding">
        <div className="p-1.5 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100" id="brand-logo-container">
          <DojoHubLogo size={34} />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-white leading-none" id="brand-title">
            DOJO <span className="text-crimson-500">HUB</span>
          </h1>
          <span className="text-[10px] font-mono text-gray-400 tracking-wider uppercase" id="brand-tagline">
            Certification Engine
          </span>
        </div>
      </div>

      {/* Active Role Quick Indicator */}
      <div className="px-6 py-4 bg-navy-900 border-b border-navy-800/60" id="active-role-indicator">
        <span className="text-[10px] font-mono text-gray-400 uppercase block tracking-wider" id="role-indicator-label">
          Active Security Shell
        </span>
        <div className="flex items-center gap-2 mt-1" id="role-badge-container">
          <span className="w-2 h-2 rounded-full bg-crimson-500 animate-ping" id="role-status-dot"></span>
          <span className="text-sm font-sans font-semibold capitalize text-white" id="role-display-name">
            {activeRole === 'student' && '👨‍💻 Student'}
            {activeRole === 'admin' && '🛡️ Platform Admin'}
            {activeRole === 'evaluator' && '🎓 Senior Supervisor'}
          </span>
        </div>
      </div>

      {/* Dynamic Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto" id="sidebar-navigation">
        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider px-3 mb-2" id="nav-group-header">
          Navigation Directory
        </p>
        {currentItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              id={`nav-link-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group text-left ${
                isActive 
                  ? 'bg-crimson-600 text-white shadow-md shadow-crimson-900/30 font-semibold' 
                  : 'text-gray-300 hover:bg-navy-900 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3" id={`nav-label-container-${item.id}`}>
                <IconComponent 
                  className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-crimson-500'
                  }`} 
                  id={`nav-icon-${item.id}`}
                />
                <span id={`nav-text-${item.id}`}>{item.name}</span>
              </div>
              
              {item.badge && (
                <span 
                  id={`nav-badge-${item.id}`}
                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold uppercase ${
                    item.badgeType === 'crimson' || isActive
                      ? 'bg-white text-crimson-600' 
                      : 'bg-crimson-600/20 text-crimson-400 border border-crimson-500/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-navy-800 bg-navy-950 text-xs text-gray-400 space-y-1" id="sidebar-footer">
        <div className="flex items-center justify-between" id="footer-status-row">
          <span className="font-mono text-[10px]" id="footer-status-label">Engine Node:</span>
          <span className="font-mono text-[10px] text-green-400 font-semibold" id="footer-status-value">ONLINE (SSL)</span>
        </div>
        <div className="flex items-center justify-between" id="footer-certs-row">
          <span className="font-mono text-[10px]" id="footer-certs-label">Active Credentials:</span>
          <span className="font-mono text-[10px] text-crimson-400 font-bold" id="footer-certs-value">{totalCredentialsCount}</span>
        </div>
        <p className="text-[9px] text-center text-gray-500 pt-3 border-t border-navy-800/40" id="footer-copyright">
          © 2026 Dojo Hub Platform Inc.
        </p>
      </div>
    </aside>
  );
}
