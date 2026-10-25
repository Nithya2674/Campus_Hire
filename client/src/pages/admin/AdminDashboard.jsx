import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Building2,
  Briefcase,
  FileText,
  Award,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/admin/stats');
        if (res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading placement administration center..." />;
  }

  const s = stats || {
    totalStudents: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    placementRate: 0,
    statusMap: { applied: 0, shortlisted: 0, selected: 0, rejected: 0, withdrawn: 0 },
    recentApplications: [],
    recentJobs: [],
  };

  const statusMap = s.statusMap || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Placement Administration & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Platform Overview & Placement Metrics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time audit telemetry across all campus drives, candidates, and hiring companies.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{s.totalStudents}</p>
          <p className="text-[11px] text-slate-500">Registered candidates</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Recruiters</span>
            <Building2 className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{s.totalRecruiters}</p>
          <p className="text-[11px] text-slate-500">Corporate partners</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Drives</span>
            <Briefcase className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{s.totalJobs}</p>
          <p className="text-[11px] text-slate-500">{s.publishedJobs} active drives</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Applications</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{s.totalApplications}</p>
          <p className="text-[11px] text-slate-500">Processed entries</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Placement Rate</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{s.placementRate}%</p>
          <p className="text-[11px] text-slate-500">Offers / Applied students</p>
        </div>
      </div>

      {/* Application Status Distribution Breakdown */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Campus Application Conversion Pipeline
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-center space-y-1">
            <span className="text-xs font-semibold text-blue-700">Applied</span>
            <p className="text-2xl font-black text-blue-900">{statusMap.applied || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 text-center space-y-1">
            <span className="text-xs font-semibold text-purple-700">Shortlisted</span>
            <p className="text-2xl font-black text-purple-900">{statusMap.shortlisted || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-center space-y-1">
            <span className="text-xs font-semibold text-emerald-700">Selected (Offers)</span>
            <p className="text-2xl font-black text-emerald-900">{statusMap.selected || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-100 text-center space-y-1">
            <span className="text-xs font-semibold text-rose-700">Rejected</span>
            <p className="text-2xl font-black text-rose-900">{statusMap.rejected || 0}</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200 text-center space-y-1">
            <span className="text-xs font-semibold text-slate-600">Withdrawn</span>
            <p className="text-2xl font-black text-slate-800">{statusMap.withdrawn || 0}</p>
          </div>
        </div>
      </div>

      {/* 2-column Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Applications Audit */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Applications Stream</h3>
            <Link to="/admin/applications" className="text-xs font-bold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {(s.recentApplications || []).map((app) => (
              <div
                key={app._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{app.studentId?.name || 'Student'}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {app.jobId?.title} at <span className="font-semibold">{app.jobId?.company}</span>
                  </p>
                </div>
                <div className="text-right">
                  <ApplicationStatusBadge status={app.status} size="xs" />
                  <p className="text-[10px] text-slate-400 mt-1">{formatDate(app.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Job Drives */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Campus Drives</h3>
            <Link to="/admin/jobs" className="text-xs font-bold text-indigo-600 hover:underline">
              View All →
            </Link>
          </div>

          <div className="space-y-3">
            {(s.recentJobs || []).map((job) => (
              <div
                key={job._id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <h4 className="font-bold text-slate-900">{job.title}</h4>
                  <p className="text-slate-500 mt-0.5">
                    {job.company} • {job.location}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    job.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
