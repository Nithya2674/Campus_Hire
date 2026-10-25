import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  FileText,
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';

export const StudentApplicationsPage = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  // Withdraw state
  const [selectedAppToWithdraw, setSelectedAppToWithdraw] = useState(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  // Expand status history accordion
  const [expandedAppId, setExpandedAppId] = useState(null);

  const fetchApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = activeTab === 'all' ? '/applications/mine' : `/applications/mine?status=${activeTab}`;
      const res = await api.get(url);
      if (res.success && res.data?.applications) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      setError(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const handleWithdrawConfirm = async () => {
    if (!selectedAppToWithdraw) return;
    setIsWithdrawing(true);
    try {
      const res = await api.patch(`/applications/${selectedAppToWithdraw._id}/withdraw`);
      if (res.success) {
        toast.success('Application successfully withdrawn.');
        setSelectedAppToWithdraw(null);
        fetchApplications();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to withdraw application');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Applications' },
    { id: 'applied', label: 'In Review' },
    { id: 'shortlisted', label: 'Shortlisted' },
    { id: 'selected', label: 'Selected / Offered' },
    { id: 'rejected', label: 'Rejected' },
    { id: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Application Tracking
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          My Placement Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Track real-time candidate screening status and recruiter decision outcomes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Application Cards List */}
      {isLoading ? (
        <LoadingSpinner text="Fetching your application records..." />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchApplications} />
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No applications found"
          description={
            activeTab === 'all'
              ? "You haven't submitted any job applications yet."
              : `No applications with status "${activeTab}".`
          }
          actionLabel="Browse Available Drives"
          actionLink="/jobs"
        />
      ) : (
        <div className="space-y-4">
          {applications.map((app) => {
            const job = app.jobId;
            const canWithdraw = app.status === 'applied' || app.status === 'shortlisted';
            const isExpanded = expandedAppId === app._id;

            return (
              <div
                key={app._id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:border-indigo-200 transition space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition">
                      <Link to={`/jobs/${job?._id}`}>{job?.title || 'Job Title'}</Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {job?.company}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {job?.location}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Applied: {formatDate(app.appliedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <ApplicationStatusBadge status={app.status} size="md" />
                  </div>
                </div>

                {/* Cover note or details */}
                {app.coverNote && (
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-600 leading-relaxed italic">
                    "{app.coverNote}"
                  </div>
                )}

                {/* Footer Controls & Timeline Toggle */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <a
                      href={app.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Submitted Resume</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    {app.statusHistory && app.statusHistory.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setExpandedAppId(isExpanded ? null : app._id)}
                        className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-medium transition"
                      >
                        <span>Audit Timeline ({app.statusHistory.length})</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {canWithdraw && (
                      <button
                        type="button"
                        onClick={() => setSelectedAppToWithdraw(app)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition"
                      >
                        Withdraw Application
                      </button>
                    )}

                    <Link
                      to={`/jobs/${job?._id}`}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                    >
                      View Job
                    </Link>
                  </div>
                </div>

                {/* Status History Timeline Expansion */}
                {isExpanded && app.statusHistory && (
                  <div className="pt-3 border-t border-slate-100 space-y-2 animate-fade-in">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Application Status History
                    </h5>
                    <div className="space-y-2 pl-2 border-l-2 border-indigo-200">
                      {app.statusHistory.map((step, idx) => (
                        <div key={idx} className="relative pl-3 text-xs space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800 uppercase text-[10px]">
                              {step.status}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(step.changedAt)}
                            </span>
                          </div>
                          {step.note && (
                            <p className="text-slate-600 text-[11px]">{step.note}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Withdraw Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!selectedAppToWithdraw}
        title="Withdraw Application"
        message={`Are you sure you want to withdraw your application for "${selectedAppToWithdraw?.jobId?.title}" at ${selectedAppToWithdraw?.jobId?.company}? You may not be able to reapply if the job drive has reached quota.`}
        confirmText="Confirm Withdrawal"
        confirmVariant="danger"
        isLoading={isWithdrawing}
        onConfirm={handleWithdrawConfirm}
        onCancel={() => setSelectedAppToWithdraw(null)}
      />
    </div>
  );
};

export default StudentApplicationsPage;
