import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  Search,
  Shield,
  Building2,
  GraduationCap,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import DataTable from '../../components/DataTable';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';

export const AdminUsersPage = () => {
  const { user: currentAdmin } = useAuth();
  const toast = useToast();

  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [meta, setMeta] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);

  // Status toggle confirmation
  const [userToToggle, setUserToToggle] = useState(null);
  const [isToggling, setIsToggling] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('page', page.toString());
      params.set('limit', '15');

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.success && res.data) {
        setUsers(res.data.users || []);
        setMeta(res.meta || { page: 1, limit: 15, total: 0, totalPages: 1 });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to load user accounts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleConfirm = async () => {
    if (!userToToggle) return;
    setIsToggling(true);
    try {
      const res = await api.patch(`/admin/users/${userToToggle._id}/status`);
      if (res.success) {
        toast.success(res.message || 'User status updated successfully');
        setUserToToggle(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update user status');
    } finally {
      setIsToggling(false);
    }
  };

  const columns = [
    {
      header: 'User & Organization',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
              row.role === 'admin'
                ? 'bg-purple-100 text-purple-700'
                : row.role === 'recruiter'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-bold text-slate-900">{row.name}</h4>
            <p className="text-xs text-slate-500">{row.email}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {row.profile?.companyName || row.profile?.college || 'No organization specified'}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
            row.role === 'admin'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : row.role === 'recruiter'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}
        >
          {row.role === 'admin' ? (
            <Shield className="w-3 h-3" />
          ) : row.role === 'recruiter' ? (
            <Building2 className="w-3 h-3" />
          ) : (
            <GraduationCap className="w-3 h-3" />
          )}
          {row.role}
        </span>
      ),
    },
    {
      header: 'Account Status',
      accessor: 'isActive',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
            row.isActive
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {row.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
          {row.isActive ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      header: 'Registered On',
      accessor: 'createdAt',
      render: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {formatDate(row.createdAt)}
        </span>
      ),
    },
    {
      header: 'Action',
      cellClassName: 'text-right',
      render: (row) => {
        const isSelf = currentAdmin?._id === row._id;
        return (
          <button
            type="button"
            onClick={() => setUserToToggle(row)}
            disabled={isSelf}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isSelf
                ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                : row.isActive
                ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            {isSelf ? 'Current Admin' : row.isActive ? 'Deactivate' : 'Activate'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
          User Account Directory
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Manage CampusHire Accounts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Audit student records, verified recruiters, and account active statuses.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="recruiter">Recruiters</option>
            <option value="admin">Administrators</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Deactivated Only</option>
          </select>
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, college, company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </form>
      </div>

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        emptyTitle="No accounts found"
        emptyDescription="No registered users matching this query."
      />

      <Pagination
        currentPage={meta.page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        limit={meta.limit}
        onPageChange={(p) => setPage(p)}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!userToToggle}
        title={`${userToToggle?.isActive ? 'Deactivate' : 'Activate'} User Account`}
        message={`Are you sure you want to ${
          userToToggle?.isActive ? 'deactivate' : 'activate'
        } the account for ${userToToggle?.name} (${userToToggle?.email})? ${
          userToToggle?.isActive
            ? 'The user will immediately be blocked from logging into the platform.'
            : 'The user will regain login access.'
        }`}
        confirmText={userToToggle?.isActive ? 'Deactivate Account' : 'Activate Account'}
        confirmVariant={userToToggle?.isActive ? 'danger' : 'primary'}
        isLoading={isToggling}
        onConfirm={handleToggleConfirm}
        onCancel={() => setUserToToggle(null)}
      />
    </div>
  );
};

export default AdminUsersPage;
