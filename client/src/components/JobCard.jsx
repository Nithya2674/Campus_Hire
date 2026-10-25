import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, MapPin, Briefcase, Calendar, GraduationCap, ChevronRight, Check } from 'lucide-react';
import { formatDate } from '../utils/formatters';
import EligibilityBadge from './EligibilityBadge';

export const JobCard = ({ job, isStudent = false, eligibility = null, hasApplied = false }) => {
  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition">
              <Link to={`/jobs/${job._id}`}>{job.title}</Link>
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>{job.company}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                job.jobType === 'Full-time'
                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
              }`}
            >
              {job.jobType}
            </span>

            {job.status === 'closed' || isExpired ? (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Closed
              </span>
            ) : null}
          </div>
        </div>

        {/* Location & Details */}
        <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </div>
          {job.salaryRange && (
            <div className="flex items-center gap-1 font-medium text-slate-700">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.salaryRange}</span>
            </div>
          )}
          {job.eligibility?.minCgpa > 0 && (
            <div className="flex items-center gap-1 text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
              <span>Min CGPA: {job.eligibility.minCgpa.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Description snippet */}
        <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Required Skills */}
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {job.requiredSkills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 4 && (
              <span className="text-xs text-slate-400 self-center">
                +{job.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Deadline: {formatDate(job.applicationDeadline)}</span>
          </div>

          {isStudent && eligibility && (
            <EligibilityBadge
              isEligible={eligibility.eligible}
              reasons={eligibility.reasons}
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          {hasApplied ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Check className="w-3.5 h-3.5" />
              Applied
            </span>
          ) : (
            <Link
              to={`/jobs/${job._id}`}
              className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition group-hover:bg-indigo-600"
            >
              <span>View Details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
