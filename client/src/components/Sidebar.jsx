import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  PlusCircle,
  Users,
  ShieldCheck,
  Building2,
  FolderKanban,
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/jobs', label: 'Discover Jobs', icon: Briefcase },
    { to: '/student/applications', label: 'My Applications', icon: FileText },
    { to: '/student/profile', label: 'Profile & Resume', icon: User },
  ];

  const recruiterLinks = [
    { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/recruiter/jobs', label: 'Job Postings', icon: FolderKanban },
    { to: '/recruiter/jobs/create', label: 'Post New Job', icon: PlusCircle },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'User Management', icon: Users },
    { to: '/admin/jobs', label: 'Job Monitoring', icon: Briefcase },
    { to: '/admin/applications', label: 'Applications', icon: FileText },
  ];

  const links =
    role === 'admin'
      ? adminLinks
      : role === 'recruiter'
      ? recruiterLinks
      : studentLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-bold text-slate-800 truncate">{user.name}</h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-slate-500 capitalize">
                {role}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Navigation
          </p>
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-50'
                      : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Role Badge info */}
      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-indigo-900 space-y-1">
        <div className="flex items-center gap-1.5 font-bold">
          {role === 'admin' ? (
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          ) : role === 'recruiter' ? (
            <Building2 className="w-4 h-4 text-indigo-600" />
          ) : (
            <User className="w-4 h-4 text-indigo-600" />
          )}
          <span>{role.toUpperCase()} Portal</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Campus placement management environment.
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
