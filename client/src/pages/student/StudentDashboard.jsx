import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  FileText,
  CheckCircle2,
  Award,
  Clock,
  ArrowRight,
  Briefcase,
  AlertCircle,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';
import { formatDate } from '../../utils/formatters';
import LoadingSpinner from '../../components/LoadingSpinner';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [appRes, jobRes] = await Promise.all([
          api.get('/applications/mine?limit=10'),
          api.get('/jobs?limit=20'),
        ]);

        if (appRes.success && appRes.data?.applications) {
          setApplications(appRes.data.applications);
        }

        if (jobRes.success && jobRes.data?.jobs) {
          // Compute recommended jobs by matching student skills
          const studentSkills = (user?.profile?.skills || []).map((s) => s.toLowerCase());
          const appliedJobIds = new Set(
            (appRes.data?.applications || []).map((a) => a.jobId?._id)
          );

          const matched = jobRes.data.jobs
            .filter((j) => !appliedJobIds.has(j._id))
            .map((job) => {
              const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase());
              const matchCount = jobSkills.filter((s) => studentSkills.includes(s)).length;
              return { ...job, matchCount };
            })
            .sort((a, b) => b.matchCount - a.matchCount)
            .slice(0, 4);

          setRecommendedJobs(matched);
        }
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Profile completion calculation
  const calculateProfileCompletion = () => {
    const p = user?.profile || {};
    let score = 0;
    if (p.college) score += 15;
    if (p.degree) score += 15;
    if (p.branch) score += 20;
    if (p.graduationYear) score += 15;
    if (p.cgpa) score += 15;
    if (p.resumeUrl) score += 15;
    if (p.skills && p.skills.length > 0) score += 5;
    return Math.min(100, score);
  };

  const completionScore = calculateProfileCompletion();

  const totalApps = applications.length;
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const selectedCount = applications.filter((a) => a.status === 'selected').length;
  const inReviewCount = applications.filter((a) => a.status === 'applied').length;

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading student workspace..." />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Student Placement Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {user?.profile?.college ? `${user.profile.college} • ` : ''}
            {user?.profile?.branch || 'Set up your branch & CGPA to check job eligibility'}
          </p>
        </div>

        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition self-start sm:self-auto"
        >
          <Briefcase className="w-4 h-4" />
          <span>Browse Active Jobs</span>
        </Link>
      </div>

      {/* Profile Completion Banner if < 100 */}
      {completionScore < 100 && (
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200/80 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Your Profile is {completionScore}% Complete
              </h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
              Recruiter eligibility filters require your CGPA, branch, and resume URL to automatically qualify your applications.
            </p>
            {/* Progress bar */}
            <div className="w-full max-w-md bg-white border border-indigo-100 rounded-full h-2 overflow-hidden mt-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              />
            </div>
          </div>

          <Link
            to="/student/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition whitespace-nowrap self-start md:self-auto"
          >
            <span>Complete Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Applied</span>
            <FileText className="w-4 h-4 text-slate-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalApps}</p>
          <p className="text-[11px] text-slate-500">Submitted applications</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">In Review</span>
            <Clock className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-600">{inReviewCount}</p>
          <p className="text-[11px] text-slate-500">Awaiting screening</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-purple-600">{shortlistedCount}</p>
          <p className="text-[11px] text-slate-500">Advanced to interviews</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Selected</span>
            <Award className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{selectedCount}</p>
          <p className="text-[11px] text-slate-500">Placement offers received</p>
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Recent Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">
              Recent Application Status
            </h3>
            <Link
              to="/student/applications"
              className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
            >
              <span>View All ({totalApps})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No applications submitted yet</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Discover published job postings from top hiring partners and submit your first application.
              </p>
              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
              >
                <span>Find Placement Jobs</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.slice(0, 5).map((app) => (
                <div
                  key={app._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-indigo-200 transition flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition">
                      <Link to={`/jobs/${app.jobId?._id}`}>{app.jobId?.title || 'Job Posting'}</Link>
                    </h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {app.jobId?.company} • Applied on {formatDate(app.appliedAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <ApplicationStatusBadge status={app.status} size="sm" />
                    <Link
                      to={`/jobs/${app.jobId?._id}`}
                      className="text-slate-400 hover:text-slate-600 transition"
                      title="View Details"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recommended / Skill-matched Jobs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              Recommended for You
            </h3>
          </div>

          {recommendedJobs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500">
              No matching unapplied jobs found. Check the main job directory for new drives.
            </div>
          ) : (
            <div className="space-y-3">
              {recommendedJobs.map((job) => (
                <div
                  key={job._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm hover:border-indigo-200 transition space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                      <Link to={`/jobs/${job._id}`} className="hover:text-indigo-600">
                        {job.title}
                      </Link>
                    </h4>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 shrink-0">
                      {job.jobType}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium">
                    {job.company} • {job.location}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      Min CGPA: {job.eligibility?.minCgpa ? job.eligibility.minCgpa.toFixed(1) : 'None'}
                    </span>
                    <Link
                      to={`/jobs/${job._id}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Apply →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
