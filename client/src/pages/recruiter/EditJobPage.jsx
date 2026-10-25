import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Briefcase,
  Building2,
  GraduationCap,
  Save,
  Plus,
  X,
  ArrowLeft,
} from 'lucide-react';

export const EditJobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    location: '',
    jobType: 'Full-time',
    salaryRange: '',
    status: 'published',
    applicationDeadline: '',
  });

  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  const [minCgpa, setMinCgpa] = useState('0');
  const [eligibleBranches, setEligibleBranches] = useState([]);
  const [branchInput, setBranchInput] = useState('');
  const [allowedYears, setAllowedYears] = useState([]);
  const [yearInput, setYearInput] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/jobs/${id}`);
        if (res.success && res.data?.job) {
          const j = res.data.job;
          setFormData({
            title: j.title || '',
            company: j.company || '',
            description: j.description || '',
            location: j.location || '',
            jobType: j.jobType || 'Full-time',
            salaryRange: j.salaryRange || '',
            status: j.status || 'published',
            applicationDeadline: j.applicationDeadline
              ? new Date(j.applicationDeadline).toISOString().split('T')[0]
              : '',
          });
          setRequiredSkills(j.requiredSkills || []);
          setMinCgpa(j.eligibility?.minCgpa ? j.eligibility.minCgpa.toString() : '0');
          setEligibleBranches(j.eligibility?.eligibleBranches || []);
          setAllowedYears((j.eligibility?.allowedGraduationYears || []).map((y) => y.toString()));
        }
      } catch (err) {
        setError(err.message || 'Failed to load job details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const s = skillInput.trim();
    if (s && !requiredSkills.includes(s)) {
      setRequiredSkills([...requiredSkills, s]);
      setSkillInput('');
    }
  };

  const handleAddBranch = (e) => {
    if (e) e.preventDefault();
    const b = branchInput.trim();
    if (b && !eligibleBranches.includes(b)) {
      setEligibleBranches([...eligibleBranches, b]);
      setBranchInput('');
    }
  };

  const handleAddYear = (e) => {
    if (e) e.preventDefault();
    const y = yearInput.trim();
    if (y && !allowedYears.includes(y)) {
      setAllowedYears([...allowedYears, y]);
      setYearInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        requiredSkills,
        eligibility: {
          minCgpa: minCgpa ? parseFloat(minCgpa) : 0,
          eligibleBranches,
          allowedGraduationYears: allowedYears.map((y) => parseInt(y, 10)).filter(Boolean),
        },
        applicationDeadline: new Date(formData.applicationDeadline),
      };

      const res = await api.patch(`/jobs/${id}`, payload);
      if (res.success) {
        toast.success('Job posting updated successfully!');
        navigate('/recruiter/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to update job');
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading job posting..." />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Job Drive Configuration
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Edit Campus Job Posting
        </h1>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Job Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Job Role / Title"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <FormInput
              label="Company Name"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Job Type</label>
              <select
                value={formData.jobType}
                onChange={(e) => handleChange('jobType', e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              >
                <option value="Full-time">Full-time</option>
                <option value="Internship">Internship</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>

            <FormInput
              label="Job Location"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />

            <FormInput
              label="Salary Package / CTC"
              value={formData.salaryRange}
              onChange={(e) => handleChange('salaryRange', e.target.value)}
            />

            <FormInput
              label="Application Deadline"
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) => handleChange('applicationDeadline', e.target.value)}
              required
            />
          </div>

          <FormInput
            label="Job Description"
            rows={5}
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Required Skills</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (Press Enter)"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => setRequiredSkills(requiredSkills.filter((s) => s !== skill))}
                    className="text-slate-400 hover:text-slate-700 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility criteria */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Eligibility Cutoffs</h2>
          </div>

          <div className="space-y-5">
            <FormInput
              label="Minimum CGPA Cutoff"
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
            />

            {/* Allowed Branches */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Allowed Branches</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Computer Science and Engineering"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddBranch();
                    }
                  }}
                  className="flex-1 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddBranch}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {eligibleBranches.map((b, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold"
                  >
                    <span>{b}</span>
                    <button
                      type="button"
                      onClick={() => setEligibleBranches(eligibleBranches.filter((x) => x !== b))}
                      className="text-blue-400 hover:text-blue-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allowed Graduation Years */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Allowed Graduation Years</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 2026"
                  value={yearInput}
                  onChange={(e) => setYearInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddYear();
                    }
                  }}
                  className="w-48 px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddYear}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allowedYears.map((y, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold"
                  >
                    <span>{y} Batch</span>
                    <button
                      type="button"
                      onClick={() => setAllowedYears(allowedYears.filter((x) => x !== y))}
                      className="text-purple-400 hover:text-purple-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/recruiter/jobs')}
            className="px-5 py-3 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-2xl text-xs font-semibold transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Saving Changes...' : 'Save Job Updates'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditJobPage;
