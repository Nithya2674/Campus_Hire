import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import { Briefcase, Building2, Users, ExternalLink } from 'lucide-react';
import DataTable from '../../components/DataTable';
import Pagination from '../../components/Pagination';

export const AdminJobsPage = () => {
  const toast = useToast();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchJobs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await api.get(`/admin/jobs?${params.toString()}`);
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
        setMeta(res.meta || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load platform jobs');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, page]);

  const columns = [
    {
      header: 'Job Title & Enterprise',
      accessor: 'title',
      render: (row) => (
        <div className="space-y-0.5">
          <Link
            to={`/jobs/${row._id}`}
            className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5"
          >
            <span>{row.title}</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </Link>
          <p className="text-xs text-slate-500 font-medium">
            {row.company} • {row.location} ({row.jobType})
          </p>
        </div>
      ),
    },
    {
      header: 'Recruiter Contact',
      accessor: 'recruiterId',
      render: (row) => (
        <div className="text-xs">
          <p className="font-semibold text-slate-800">{row.recruiterId?.name || 'Recruiter'}</p>
          <p className="text-slate-400">{row.recruiterId?.email}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => (
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
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
      header: 'Total Applications',
      accessor: 'applicantCount',
      render: (row) => (
        <span className="font-bold text-slate-900 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
          {row.applicantCount || 0} Applicants
        </span>
      ),
    },
    {
      header: 'Deadline',
      accessor: 'applicationDeadline',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDate(row.applicationDeadline)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          Campus Drive Oversight
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Campus Placement Job Postings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor all open, draft, and closed campus openings posted by partnering recruiters.
        </p>
      </div>

      <div className="flex gap-2 pb-2 border-b border-slate-200">
        {[
          { id: '', label: 'All Openings' },
          { id: 'published', label: 'Published' },
          { id: 'draft', label: 'Drafts' },
          { id: 'closed', label: 'Closed' },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setStatusFilter(f.id);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
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
        data={jobs}
        isLoading={isLoading}
        emptyTitle="No jobs found"
        emptyDescription="No placement drives found under this filter."
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

export default AdminJobsPage;
