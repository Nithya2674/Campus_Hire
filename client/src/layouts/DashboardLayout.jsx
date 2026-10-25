import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  FileText,
  User,
  PlusCircle,
  Users,
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user } = useAuth();

  const getMobileLinks = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/admin/users', label: 'Users', icon: Users },
        { to: '/admin/jobs', label: 'Jobs', icon: Briefcase },
        { to: '/admin/applications', label: 'Applications', icon: FileText },
      ];
    }
    if (user.role === 'recruiter') {
      return [
        { to: '/recruiter', label: 'Dashboard', icon: LayoutDashboard, end: true },
        { to: '/recruiter/jobs', label: 'Jobs', icon: Briefcase },
        { to: '/recruiter/jobs/create', label: 'Post Job', icon: PlusCircle },
      ];
    }
    return [
      { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/jobs', label: 'Jobs', icon: Briefcase },
      { to: '/student/applications', label: 'Applications', icon: FileText },
      { to: '/student/profile', label: 'Profile', icon: User },
    ];
  };

  const mobileLinks = getMobileLinks();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto pb-16 md:pb-0">
        <Sidebar />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex justify-around items-center px-2 py-2">
        {mobileLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-semibold transition ${
                  isActive ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default DashboardLayout;
