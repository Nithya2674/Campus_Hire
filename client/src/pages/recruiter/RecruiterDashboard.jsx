import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Award,
  PlusCircle,
  FolderKanban,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/formatters';

export const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [metrics, setMetrics] = useState({
    totalJobs: 0,
    totalApplicants: 0,
    shortlisted: 0,
    selected: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get('/jobs?mine=true&limit=50');
        if (res.success && res.data?.jobs) {
          const recruiterJobs = res.data.jobs;
          setJobs(recruiterJobs);

          // Calculate aggregate metrics across recruiter's jobs
          let applicantsCount = 0;
          let shortlistedCount = 0;
          let selectedCount = 0;

          await Promise.all(
            recruiterJobs.map(async (job) => {
              applicantsCount += job.applicantCount || 0;
              try {
                const appRes = await api.get(`/jobs/${job._id}/applications?limit=100`);
                if (appRes.success && appRes.data?.statusCounts) {
                  shortlistedCount += appRes.data.statusCounts.shortlisted || 0;
                  selectedCount += appRes.data.statusCounts.selected || 0;
                }
              } catch {
                // Ignore
              }
            })
          );

          setMetrics({
            totalJobs: recruiterJobs.length,
            totalApplicants: applicantsCount,
            shortlisted: shortlistedCount,
            selected: selectedCount,
          });
        }
      } catch (err) {
        console.error('Failed to load recruiter data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading recruiter workspace..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Recruiter Workspace
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {user?.profile?.companyName || user?.name || 'Recruiter Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your campus placement drives, review student profiles, and coordinate hiring decisions.
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Drives</span>
            <Briefcase className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{metrics.totalJobs}</p>
          <p className="text-[11px] text-slate-500">Total job postings</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applicants</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{metrics.totalApplicants}</p>
          <p className="text-[11px] text-slate-500">Student submissions</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{metrics.shortlisted}</p>
          <p className="text-[11px] text-slate-500">Candidate shortlists</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Selected / Offers</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.selected}</p>
          <p className="text-[11px] text-slate-500">Official selections</p>
        </div>
      </div>

      {/* Recruiter Job Postings Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-indigo-600" />
            Your Job Postings & Candidate Inflow
          </h2>
          <Link
            to="/recruiter/jobs"
            className="text-xs font-bold text-indigo-600 hover:underline"
          >
            Manage All Jobs →
          </Link>
        </div>

        {jobs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No campus jobs posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first campus placement opening with defined branch cutoffs, CGPA minimums, and application deadlines.
            </p>
            <Link
              to="/recruiter/jobs/create"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Placement Opening</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:border-indigo-200 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {job.location} • {job.jobType}
                    </p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      job.status === 'published'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : job.status === 'draft'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Candidate stats for this job */}
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500">Total Applicants</span>
                    <p className="text-lg font-black text-slate-900 mt-0.5">
                      {job.applicantCount || 0}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500">Deadline</span>
                    <p className="font-semibold text-slate-800 mt-0.5">
                      {formatDate(job.applicationDeadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <Link
                    to={`/recruiter/jobs/${job._id}/edit`}
                    className="text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    Edit Opening
                  </Link>

                  <Link
                    to={`/recruiter/jobs/${job._id}/applicants`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    <span>Screen Applicants</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecruiterDashboard;
