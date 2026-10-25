import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import FormInput from '../../components/FormInput';
import {
  Briefcase,
  Building2,
  GraduationCap,
  Save,
  Plus,
  X,
  ArrowLeft,
} from 'lucide-react';

export const CreateJobPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    title: '',
    company: user?.profile?.companyName || '',
    description: '',
    location: user?.profile?.companyLocation || 'Bengaluru, India',
    jobType: 'Full-time',
    salaryRange: '₹12 - 18 LPA',
    status: 'published',
    applicationDeadline: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
  });

  const [requiredSkills, setRequiredSkills] = useState(['React', 'Node.js', 'MongoDB']);
  const [skillInput, setSkillInput] = useState('');

  // Eligibility criteria
  const [minCgpa, setMinCgpa] = useState('7.0');
  const [eligibleBranches, setEligibleBranches] = useState([
    'Computer Science and Engineering',
    'Information Technology',
  ]);
  const [branchInput, setBranchInput] = useState('');
  const [allowedYears, setAllowedYears] = useState(['2026']);
  const [yearInput, setYearInput] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    if (!formData.title.trim()) {
      setError('Please provide a job title.');
      return;
    }
    if (!formData.company.trim()) {
      setError('Please provide a company name.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please provide a job description.');
      return;
    }

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

      const res = await api.post('/jobs', payload);
      if (res.success && res.data?.job) {
        toast.success('Campus job opening published successfully!');
        navigate(`/recruiter/jobs`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create job posting');
      toast.error(err.message || 'Creation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Jobs</span>
        </button>

        <span className="text-xs font-bold uppercase tracking-wider text-blue-600 block">
          Campus Recruitment Drive
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Post New Campus Placement Opening
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Define student cutoff thresholds, branch criteria, and job specifications.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Job Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Job Specifications</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Job Role / Title"
              placeholder="e.g. Graduate Software Development Engineer"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <FormInput
              label="Company Name"
              placeholder="e.g. Google India"
              value={formData.company}
              onChange={(e) => handleChange('company', e.target.value)}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">
                Job Type <span className="text-rose-500">*</span>
              </label>
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
              placeholder="e.g. Bengaluru, Hyderabad, Remote"
              value={formData.location}
              onChange={(e) => handleChange('location', e.target.value)}
              required
            />

            <FormInput
              label="Offered CTC / Salary Package"
              placeholder="e.g. ₹18 - 24 LPA or ₹60,000/month Stipend"
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
            label="Complete Job Description & Requirements"
            rows={5}
            placeholder="Outline candidate responsibilities, role overview, and team culture..."
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Publication Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            >
              <option value="published">Published (Visible to students immediately)</option>
              <option value="draft">Draft (Private recruiter work-in-progress)</option>
            </select>
          </div>
        </div>

        {/* Required Technical Skills */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Required Technical Skills</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, Node.js, Docker, Java (Press Enter)"
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
                <span>Add Skill</span>
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

        {/* Eligibility Engine Criteria */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Student Eligibility Rules (Server Enforced)
            </h2>
          </div>

          <div className="space-y-5">
            <FormInput
              label="Minimum CGPA Cutoff (0.0 to 10.0)"
              type="number"
              step="0.1"
              min="0"
              max="10"
              placeholder="e.g. 7.5 (0 = No CGPA restriction)"
              value={minCgpa}
              onChange={(e) => setMinCgpa(e.target.value)}
              helperText="Students with a CGPA below this cutoff will be automatically prevented from applying."
            />

            {/* Allowed Branches */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Eligible Engineering Branches / Majors
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Computer Science, Information Technology, Electronics"
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
                  <span>Add Branch</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {eligibleBranches.map((branch, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold"
                  >
                    <span>{branch}</span>
                    <button
                      type="button"
                      onClick={() => setEligibleBranches(eligibleBranches.filter((b) => b !== branch))}
                      className="text-blue-400 hover:text-blue-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic">
                {eligibleBranches.length === 0
                  ? 'No branches specified: Open to all academic departments.'
                  : 'Only students in these branches will qualify.'}
              </p>
            </div>

            {/* Allowed Graduation Years */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                Allowed Graduation Years (e.g. 2025, 2026)
              </label>
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
                  <span>Add Year</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {allowedYears.map((year, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold"
                  >
                    <span>{year} Batch</span>
                    <button
                      type="button"
                      onClick={() => setAllowedYears(allowedYears.filter((y) => y !== year))}
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

        {/* Submit */}
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
            <span>{isSubmitting ? 'Publishing Opening...' : 'Publish Job Opening'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateJobPage;
