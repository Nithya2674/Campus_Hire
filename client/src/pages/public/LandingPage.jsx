import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  Award,
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    placementRate: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchPlatformStats = async () => {
      try {
        // Attempt to fetch real platform statistics
        const res = await api.get('/admin/stats');
        if (res.success && res.data) {
          setStats({
            totalStudents: res.data.totalStudents || 0,
            totalRecruiters: res.data.totalRecruiters || 0,
            totalJobs: res.data.totalJobs || 0,
            totalApplications: res.data.totalApplications || 0,
            placementRate: res.data.placementRate || 0,
          });
        }
      } catch {
        // If unauthenticated or no admin rights, fetch public jobs count
        try {
          const jobsRes = await api.get('/jobs?limit=1');
          if (jobsRes.success) {
            setStats((prev) => ({
              ...prev,
              totalJobs: jobsRes.meta?.total || 0,
            }));
          }
        } catch {
          // Keep 0 if backend is unseeded
        }
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchPlatformStats();
  }, []);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'recruiter') return '/recruiter';
    return '/student';
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 md:pt-20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.indigo.50),theme(colors.slate.50))] opacity-70" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Campus Placement Season 2025–2026 Live</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Bridging Ambitious Graduates & Top-Tier Campus Recruiters.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CampusHire streamlines every step of university hiring — from automated eligibility checks and resume submission to recruiter candidate shortlisting and placement audit.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/jobs"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-base font-semibold rounded-2xl shadow-lg shadow-indigo-200 transition"
            >
              <span>Explore Open Drives</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            {!isAuthenticated ? (
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-base font-semibold rounded-2xl shadow-sm transition"
              >
                <span>Register as Student / Recruiter</span>
              </Link>
            ) : (
              <Link
                to={getDashboardLink()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white text-base font-semibold rounded-2xl shadow-sm transition"
              >
                <span>Go to Your Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Real Platform Statistics (No fake numbers) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-sm">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Live Verified Database Metrics
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Real-time Placement Drive Activity
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {isLoadingStats ? '...' : stats.totalJobs}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Active Job Postings
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-indigo-600">
                {isLoadingStats ? '...' : stats.totalApplications}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Applications Processed
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                {isLoadingStats ? '...' : stats.totalStudents}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Registered Students
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-600">
                {isLoadingStats ? '...' : `${stats.placementRate}%`}
              </p>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
                Offer Conversion Rate
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Feature Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Tailored User Roles
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Engineered for the Entire Placement Ecosystem
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Student Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Students</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Build an academic profile, see instant eligibility reasons, apply with one click, and track your application status live.
              </p>
              <ul className="space-y-2.5 pt-2">
                {[
                  'Automated CGPA & Branch criteria check',
                  'One-click application with verified resume',
                  'Live status tracking: Shortlisted, Selected, Rejected',
                  'Withdrawal management for open drives',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                to="/register?role=student"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5"
              >
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Recruiter Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Recruiters</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Post custom campus openings, enforce strict branch and CGPA cutoffs, and review candidate resumes with instant decision statuses.
              </p>
              <ul className="space-y-2.5 pt-2">
                {[
                  'Custom eligibility parameters & deadlines',
                  'Exclusive ownership of recruiter openings',
                  'Direct resume links and applicant profile viewer',
                  'Status workflow: Shortlist, Reject, or Select with notes',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                to="/register?role=recruiter"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5"
              >
                <span>Register as Recruiter</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">For Placement Cells</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Monitor complete campus placement health, prevent fraudulent access, audit recruiter activities, and calculate aggregate placement ratios.
              </p>
              <ul className="space-y-2.5 pt-2">
                {[
                  'Secure seed-controlled administrator access',
                  'User management with account deactivation',
                  'Cross-company job and application audit',
                  'Placement rate & cohort performance statistics',
                ].map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-6 mt-6 border-t border-slate-100">
              <Link
                to="/login"
                className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
              >
                <span>Admin Login Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-slate-100/70 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              How Campus Placements Work on CampusHire
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              From student registration to offer letter issuance in three seamless phases.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                1
              </div>
              <h4 className="text-base font-bold text-slate-900">Complete Profile</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Add your degree, branch, verified CGPA, core engineering skills, and a verifiable resume link.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                2
              </div>
              <h4 className="text-base font-bold text-slate-900">Check Eligibility & Apply</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The platform checks your credentials against company requirements. If eligible, apply with zero friction before the deadline.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                3
              </div>
              <h4 className="text-base font-bold text-slate-900">Shortlisting & Offers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recruiters screen applicant pools, shortlist top candidates, and extend official placement selections directly on the portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-10 sm:p-14 text-white text-center shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Supercharge Your Campus Placement Drive?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-indigo-200 max-w-xl mx-auto">
            Get started today with preloaded sample data or connect your institution's placement cell.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              to="/jobs"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition"
            >
              Browse Open Positions
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-xl backdrop-blur-sm transition"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
