import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Send,
  FileText,
  ExternalLink,
  ShieldCheck,
  Check,
} from 'lucide-react';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorState from '../../components/ErrorState';
import FormInput from '../../components/FormInput';
import ApplicationStatusBadge from '../../components/ApplicationStatusBadge';

export const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();

  const [job, setJob] = useState(null);
  const [eligibility, setEligibility] = useState(null);
  const [studentApplication, setStudentApplication] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [applyError, setApplyError] = useState(null);

  const fetchJobDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get(`/jobs/${id}`);
      if (res.success && res.data?.job) {
        setJob(res.data.job);
        if (res.data.job.studentApplication) {
          setStudentApplication(res.data.job.studentApplication);
        }
        if (res.data.job.eligibility) {
          setEligibility(res.data.job.eligibility);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load job details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobDetails();
  }, [id, isAuthenticated]);

  // Set default resume url from user profile when modal opens
  useEffect(() => {
    if (user?.profile?.resumeUrl) {
      setResumeUrl(user.profile.resumeUrl);
    }
  }, [user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resumeUrl || !resumeUrl.trim()) {
      setApplyError('Please provide a valid resume link (e.g. Google Drive, Dropbox, or Portfolio).');
      return;
    }

    setIsSubmitting(true);
    setApplyError(null);

    try {
      const res = await api.post(`/jobs/${id}/apply`, {
        resumeUrl: resumeUrl.trim(),
        coverNote: coverNote.trim(),
      });

      if (res.success) {
        toast.success('Your application was submitted successfully!');
        setStudentApplication(res.data?.application);
        setIsApplyModalOpen(false);
        // Refresh job details
        fetchJobDetails();
      }
    } catch (err) {
      setApplyError(err.message || 'Failed to submit application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading placement drive details..." />;
  }

  if (error || !job) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <ErrorState
          title="Job Posting Unavailable"
          message={error || 'Could not find the requested job posting.'}
          onRetry={fetchJobDetails}
        />
        <div className="text-center mt-4">
          <Link to="/jobs" className="text-sm font-semibold text-indigo-600 hover:underline">
            ← Return to all jobs
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = job.applicationDeadline && new Date(job.applicationDeadline) < new Date();
  const isStudent = isAuthenticated && user?.role === 'student';
  const hasApplied = !!studentApplication;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      {/* Hero Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {job.company}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-xs font-medium text-slate-500">
                Posted {formatDate(job.createdAt)}
              </span>
              {job.status === 'closed' || isExpired ? (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                  Closed / Expired
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Actively Hiring
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 font-medium">
              <div className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span>{job.company}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-slate-400" />
                <span>{job.jobType}</span>
              </div>
              {job.salaryRange && (
                <div className="flex items-center gap-1.5 text-slate-900 font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                  <span>{job.salaryRange}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="flex flex-col sm:items-end gap-3 shrink-0">
            {hasApplied ? (
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 text-center sm:text-right space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-end">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-indigo-900">Application Submitted</span>
                </div>
                <div className="pt-1">
                  <ApplicationStatusBadge status={studentApplication.status} size="md" />
                </div>
                <Link
                  to="/student/applications"
                  className="block text-xs font-medium text-indigo-600 hover:underline pt-1"
                >
                  View in My Applications →
                </Link>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-2xl shadow-md shadow-indigo-100 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Sign In to Apply</span>
                </Link>
                <p className="text-[11px] text-slate-400 text-center sm:text-right">
                  Requires verified student profile
                </p>
              </div>
            ) : isStudent ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(true)}
                  disabled={
                    job.status !== 'published' ||
                    isExpired ||
                    (eligibility && !eligibility.eligible)
                  }
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-2xl shadow-md shadow-indigo-100 transition"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>

                {eligibility && !eligibility.eligible && (
                  <p className="text-[11px] text-amber-700 font-medium text-center sm:text-right">
                    You do not meet the minimum criteria for this position.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 font-medium text-center">
                Signed in as {user.role.toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Eligibility Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Job Description & Skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Description */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Role Overview & Description
            </h2>
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              {job.description}
            </div>
          </div>

          {/* Required Skills */}
          {job.requiredSkills && job.requiredSkills.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Key Competencies & Required Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hiring Recruiter / Company Details */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-3">
            <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              About the Hiring Partner
            </h2>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg">
                {job.company.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{job.company}</h3>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
            </div>
            {job.recruiterId?.profile?.companyWebsite && (
              <a
                href={job.recruiterId.profile.companyWebsite}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-600 hover:underline pt-2 font-medium"
              >
                <span>Visit Company Careers Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Eligibility Assessment Panel */}
        <div className="lg:col-span-1 space-y-6 sticky top-20">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                Eligibility Criteria
              </h3>
              {isStudent && eligibility && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    eligibility.eligible
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}
                >
                  {eligibility.eligible ? 'Eligible' : 'Not Eligible'}
                </span>
              )}
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-4 text-xs">
              {/* CGPA */}
              <div className="flex items-start justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-semibold text-slate-800">Minimum CGPA</p>
                  <p className="text-slate-500 mt-0.5">
                    {job.eligibility?.minCgpa > 0
                      ? `${job.eligibility.minCgpa.toFixed(1)} / 10.0`
                      : 'No minimum cutoff specified'}
                  </p>
                </div>
                {isStudent && user?.profile?.cgpa !== null && (
                  <span className="font-bold text-slate-700">
                    Your CGPA: {user.profile.cgpa}
                  </span>
                )}
              </div>

              {/* Eligible Branches */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-800">Allowed Engineering Branches</p>
                <p className="text-slate-500">
                  {job.eligibility?.eligibleBranches && job.eligibility.eligibleBranches.length > 0
                    ? job.eligibility.eligibleBranches.join(', ')
                    : 'Open to all academic disciplines'}
                </p>
              </div>

              {/* Graduation Batches */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <p className="font-semibold text-slate-800">Target Graduation Year</p>
                <p className="text-slate-500">
                  {job.eligibility?.allowedGraduationYears && job.eligibility.allowedGraduationYears.length > 0
                    ? job.eligibility.allowedGraduationYears.join(', ')
                    : 'Any active graduating batch'}
                </p>
              </div>

              {/* Application Deadline */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Application Deadline</span>
                </div>
                <p className={`font-medium ${isExpired ? 'text-rose-600' : 'text-slate-600'}`}>
                  {formatDate(job.applicationDeadline)}
                  {isExpired && ' (Passed)'}
                </p>
              </div>
            </div>

            {/* Ineligibility Reason Box if present */}
            {isStudent && eligibility && !eligibility.eligible && (
              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs space-y-2">
                <p className="font-bold text-amber-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700" />
                  Reason for Ineligibility
                </p>
                <ul className="space-y-1 text-amber-800 pl-4 list-disc">
                  {eligibility.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                {eligibility.profileIncomplete && (
                  <Link
                    to="/student/profile"
                    className="inline-block text-indigo-700 font-bold hover:underline pt-1"
                  >
                    Complete Your Profile Now →
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 animate-fade-in space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Application Submission
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                Apply for {job.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Submitting application directly to <span className="font-semibold text-slate-700">{job.company}</span>.
              </p>
            </div>

            {applyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium">
                {applyError}
              </div>
            )}

            <form onSubmit={handleApply} className="space-y-4">
              <FormInput
                label="Verified Resume Link"
                placeholder="https://drive.google.com/... or portfolio URL"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                helperText="Provide an accessible Google Drive, Dropbox, or PDF link."
                required
              />

              <FormInput
                label="Cover Note / Pitch (Optional)"
                rows={3}
                placeholder="Briefly state why you are a strong candidate for this position..."
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
              />

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                By submitting, your academic profile (CGPA: {user?.profile?.cgpa || 'N/A'}, Branch: {user?.profile?.branch || 'N/A'}) will be shared with the recruiter.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm & Apply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailsPage;
