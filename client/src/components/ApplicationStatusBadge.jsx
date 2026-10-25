import React from 'react';
import { Clock, CheckCircle, CheckCheck, XCircle, ArrowLeftCircle } from 'lucide-react';

export const ApplicationStatusBadge = ({ status = 'applied', size = 'sm' }) => {
  const configs = {
    applied: {
      label: 'Applied',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock,
    },
    shortlisted: {
      label: 'Shortlisted',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: CheckCircle,
    },
    selected: {
      label: 'Selected',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCheck,
    },
    rejected: {
      label: 'Rejected',
      color: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
    },
    withdrawn: {
      label: 'Withdrawn',
      color: 'bg-slate-100 text-slate-600 border-slate-200',
      icon: ArrowLeftCircle,
    },
  };

  const current = configs[status.toLowerCase()] || configs.applied;
  const Icon = current.icon;

  const sizeClasses = {
    xs: 'px-2 py-0.5 text-[11px] gap-1',
    sm: 'px-2.5 py-1 text-xs gap-1.5',
    md: 'px-3 py-1.5 text-sm gap-2',
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${
        current.color
      } ${sizeClasses[size] || sizeClasses.sm}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {current.label}
    </span>
  );
};

export default ApplicationStatusBadge;
