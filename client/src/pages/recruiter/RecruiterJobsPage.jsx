import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  PlusCircle,
  Users,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import LoadingSpinner from '../../components/LoadingSpinner';

export const RecruiterJobsPage = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Delete modal state
  const [jobToDelete, setJobToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const url = statusFilter === 'all' ? '/jobs?mine=true' : `/jobs?mine=true&status=${statusFilter}`;
      const res = await api.get(url);
      if (res.success && res.data?.jobs) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter]);

  const handleTogglePublish = async (job) => {
    try {
      const endpoint = job.status === 'published' ? `/jobs/${job._id}/close` : `/jobs/${job._id}/publish`;
      const res = await api.patch(endpoint);
      if (res.success) {
        toast.success(`Job marked as ${job.status === 'published' ? 'closed' : 'published'}`);
        fetchJobs();
      }
    } catch (err) {
      toast.error(err.message || 'Status update failed');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!jobToDelete) return;
    setIsDeleting(true);
    try {
      const res = await api.delete(`/jobs/${jobToDelete._id}`);
      if (res.success) {
        toast.success('Job posting removed successfully');
        setJobToDelete(null);
        fetchJobs();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to delete job');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Job Title & Location',
      accessor: 'title',
      render: (row) => (
        <div className="space-y-0.5">
          <Link
            to={`/recruiter/jobs/${row._id}/applicants`}
            className="font-bold text-slate-900 hover:text-indigo-600 transition"
          >
            {row.title}
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            {row.company} • {row.location} ({row.jobType})
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            row.status === 'published'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : row.status === 'draft'
              ? 'bg-slate-100 text-slate-600 border border-slate-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Applicants',
      accessor: 'applicantCount',
      render: (row) => (
        <Link
          to={`/recruiter/jobs/${row._id}/applicants`}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold transition"
        >
          <Users className="w-3.5 h-3.5" />
          <span>{row.applicantCount || 0} Candidates</span>
        </Link>
      ),
    },
    {
      header: 'Deadline',
      accessor: 'applicationDeadline',
      render: (row) => (
        <span className="text-xs text-slate-600 font-medium">
          {formatDate(row.applicationDeadline)}
        </span>
      ),
    },
    {
      header: 'Actions',
      cellClassName: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {/* Publish / Close Toggle */}
          <button
            type="button"
            onClick={() => handleTogglePublish(row)}
            title={row.status === 'published' ? 'Close job' : 'Publish job'}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
          >
            {row.status === 'published' ? (
              <XCircle className="w-4 h-4 text-amber-600" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            )}
          </button>

          {/* Edit */}
          <Link
            to={`/recruiter/jobs/${row._id}/edit`}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Edit job opening"
          >
            <Edit className="w-4 h-4" />
          </Link>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setJobToDelete(row)}
            className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
            title="Delete job posting"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Hiring Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            My Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your campus listings, adjust cutoffs, and monitor student submissions.
          </p>
        </div>

        <Link
          to="/recruiter/jobs/create"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Campus Job</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-2 border-b border-slate-200">
        {['all', 'published', 'draft', 'closed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition ${
              statusFilter === status
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={jobs}
        isLoading={isLoading}
        emptyTitle="No jobs found"
        emptyDescription="You have not created any job postings with this status."
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
        title="Delete Job Posting"
        message={`Are you sure you want to permanently delete "${jobToDelete?.title}"? Applications submitted by students may be affected.`}
        confirmText="Delete Posting"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setJobToDelete(null)}
      />
    </div>
  );
};

export default RecruiterJobsPage;
