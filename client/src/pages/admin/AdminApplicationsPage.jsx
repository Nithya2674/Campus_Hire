import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { FileText, ExternalLink, GraduationCap, Building2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';

export const AdminApplicationsPage = () => {
  const toast = useToast();
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('limit', '20');

      const res = await api.get(`/admin/applications?${params.toString()}`);
      if (res.success && res.data) {
        setApplications(res.data.applications || []);
        setMeta(res.meta || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, page]);

  const columns = [
    {
      header: 'Student Candidate',
      accessor: 'studentId',
      render: (row) => (
        <div>
          <h4 className="font-bold text-slate-900">{row.studentId?.name || 'Student'}</h4>
          <p className="text-xs text-slate-500">{row.studentId?.email}</p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
            <span>{row.studentId?.profile?.branch || 'General'}</span>
            <span>•</span>
            <span>CGPA: {row.studentId?.profile?.cgpa || 'N/A'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Applied Role & Company',
      accessor: 'jobId',
      render: (row) => (
        <div className="space-y-0.5 text-xs">
          <Link
            to={`/jobs/${row.jobId?._id}`}
            className="font-bold text-slate-900 hover:text-indigo-600 transition"
          >
            {row.jobId?.title || 'Job Opening'}
          </Link>
          <p className="text-slate-500 font-medium">{row.jobId?.company}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => <ApplicationStatusBadge status={row.status} size="sm" />,
    },
    {
      header: 'Applied Date',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Resume',
      cellClassName: 'text-right',
      render: (row) => (
        <a
          href={row.resumeUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline"
        >
          <span>Resume Link</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Placement Audit Trail
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Platform-Wide Applications
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete ledger of all student submissions and recruiter decision updates.
        </p>
      </div>

      <div className="flex gap-2 pb-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: '', label: 'All Submissions' },
          { id: 'applied', label: 'In Review' },
          { id: 'shortlisted', label: 'Shortlisted' },
          { id: 'selected', label: 'Selected' },
          { id: 'rejected', label: 'Rejected' },
          { id: 'withdrawn', label: 'Withdrawn' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setStatusFilter(f.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              statusFilter === f.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <DataTable
        columns={columns}
        data={applications}
        isLoading={isLoading}
        emptyTitle="No applications found"
        emptyDescription="No platform application records match this filter."
      />

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        limit={meta.limit}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default AdminApplicationsPage;
