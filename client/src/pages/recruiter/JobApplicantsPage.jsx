import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  ExternalLink,
  GraduationCap,
  Award,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  FileText,
  SlidersHorizontal,
} from 'lucide-react';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

export const JobApplicantsPage = () => {
  const { id: jobId } = useParams();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Status Change Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [newStatus, setNewStatus] = useState('shortlisted');
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchApplicants = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await api.get(`/jobs/${jobId}/applications?${params.toString()}`);
      if (res.success && res.data) {
        setJob(res.data.job);
        setApplications(res.data.applications || []);
        setStatusCounts(res.data.statusCounts || {});
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch applicants');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchApplicants();
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedApp) return;

    setIsUpdating(true);
    try {
      const res = await api.patch(`/applications/${selectedApp._id}/status`, {
        status: newStatus,
        note: statusNote.trim(),
      });

      if (res.success) {
        toast.success(`Application updated to ${newStatus}`);
        setSelectedApp(null);
        setStatusNote('');
        fetchApplicants();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const openStatusModal = (app) => {
    setSelectedApp(app);
    setNewStatus(app.status === 'applied' ? 'shortlisted' : app.status);
    setStatusNote('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <Link
          to="/recruiter/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Candidate Screening Pool
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
              Applicants for {job?.title || 'Job Opening'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {job?.company} • Location: {job?.location} • Min CGPA: {job?.eligibility?.minCgpa || 'None'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 bg-slate-100 rounded-xl text-slate-700">
              {statusCounts.all || 0} Total Submissions
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Row */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        {/* Status Tabs */}
        <div className="flex overflow-x-auto gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All', count: statusCounts.all },
            { id: 'applied', label: 'In Review', count: statusCounts.applied },
            { id: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
            { id: 'selected', label: 'Selected', count: statusCounts.selected },
            { id: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.id ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search candidates by name, branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
          />
        </form>
      </div>

      {/* Candidate List */}
      {isLoading ? (
        <LoadingSpinner text="Loading candidate profiles..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApplicants} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidates found"
          description="There are currently no applicant submissions matching your search and filter criteria."
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const student = app.studentId;
            const profile = student?.profile || {};

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  {/* Student details */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm">
                        {student?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{student?.name}</h3>
                        <p className="text-xs text-slate-500">{student?.email}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600 font-medium pt-1">
                      <span className="flex items-center gap-1 text-slate-700">
                        <GraduationCap className="w-4 h-4 text-indigo-500" />
                        {profile.degree || 'B.Tech'} in {profile.branch || 'Engineering'}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        CGPA: {profile.cgpa ? Number(profile.cgpa).toFixed(2) : 'N/A'}
                      </span>
                      <span>•</span>
                      <span>Batch: {profile.graduationYear || '2026'}</span>
                      <span>•</span>
                      <span>College: {profile.college || 'University'}</span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col sm:items-end gap-2 shrink-0">
                    <ApplicationStatusBadge status={app.status} size="md" />

                    {app.status !== 'withdrawn' && (
                      <button
                        type="button"
                        onClick={() => openStatusModal(app)}
                        className="px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                      >
                        Update Decision
                      </button>
                    )}
                  </div>
                </div>

                {/* Candidate pitch / cover note */}
                {app.coverNote && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 italic border border-slate-100">
                    "{app.coverNote}"
                  </div>
                )}

                {/* Skills & Resume link */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.skills || []).slice(0, 6).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <a
                    href={app.resumeUrl || profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Student Resume</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Decision Status Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-fade-in space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Placement Evaluation Decision
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                Candidate: {selectedApp.studentId?.name}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Current Status: <span className="capitalize font-semibold">{selectedApp.status}</span>
              </p>
            </div>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Select New Candidate Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'shortlisted', label: 'Shortlist', color: 'border-purple-300 text-purple-700 hover:bg-purple-50' },
                    { id: 'selected', label: 'Select / Offer', color: 'border-emerald-300 text-emerald-700 hover:bg-emerald-50' },
                    { id: 'rejected', label: 'Reject', color: 'border-rose-300 text-rose-700 hover:bg-rose-50' },
                  ].map((btn) => (
                    <button
                      key={btn.id}
                      type="button"
                      onClick={() => setNewStatus(btn.id)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold transition text-center ${
                        newStatus === btn.id
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : `bg-white ${btn.color}`
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Recruiter Feedback Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Cleared technical interview round with high scores..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  disabled={isUpdating}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicantsPage;
