import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { GraduationCap } from 'lucide-react';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base font-black tracking-tight text-slate-900">
                  Campus<span className="text-indigo-600">Hire</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Modern full-stack campus placement management system connecting ambitious students, top university recruiters, and placement officers.
              </p>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">For Students</h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/jobs" className="hover:text-indigo-600 transition">Browse Placement Drives</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition">Student Login</Link></li>
                <li><Link to="/register" className="hover:text-indigo-600 transition">Create Profile</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">For Recruiters</h5>
              <ul className="space-y-2 text-xs text-slate-600">
                <li><Link to="/register" className="hover:text-indigo-600 transition">Register Company</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition">Post Job Openings</Link></li>
                <li><Link to="/login" className="hover:text-indigo-600 transition">Candidate Screening</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Placement Cell</h5>
              <p className="text-xs text-slate-500 leading-relaxed mb-3">
                Placement department contact: <br />
                <span className="font-semibold text-slate-700">placements@college.edu</span>
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Drives 2025 - 2026 Active
              </span>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
            <p>© {new Date().getFullYear()} CampusHire Platform. Built for University Placements & Software Engineering Portfolios.</p>
            <div className="flex items-center gap-4">
              <span>Production-Ready MERN Stack Architecture</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
