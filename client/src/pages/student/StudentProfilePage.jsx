import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import FormInput from '../../components/FormInput';
import {
  User,
  GraduationCap,
  FileText,
  Save,
  Plus,
  X,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';

export const StudentProfilePage = () => {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [profile, setProfile] = useState({
    college: '',
    degree: '',
    branch: '',
    graduationYear: '',
    cgpa: '',
    resumeUrl: '',
    phone: '',
    bio: '',
    skills: [],
  });

  const [skillInput, setSkillInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfile({
        college: user.profile?.college || '',
        degree: user.profile?.degree || '',
        branch: user.profile?.branch || '',
        graduationYear: user.profile?.graduationYear || '',
        cgpa: user.profile?.cgpa !== null && user.profile?.cgpa !== undefined ? user.profile.cgpa : '',
        resumeUrl: user.profile?.resumeUrl || '',
        phone: user.profile?.phone || '',
        bio: user.profile?.bio || '',
        skills: user.profile?.skills || [],
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const trimmed = skillInput.trim();
    if (trimmed && !profile.skills.includes(trimmed)) {
      setProfile((prev) => ({
        ...prev,
        skills: [...prev.skills, trimmed],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const payload = {
        name: name.trim(),
        profile: {
          ...profile,
          graduationYear: profile.graduationYear ? parseInt(profile.graduationYear, 10) : null,
          cgpa: profile.cgpa !== '' ? parseFloat(profile.cgpa) : null,
        },
      };

      const res = await api.patch('/users/me', payload);
      if (res.success && res.data?.user) {
        updateUser(res.data.user);
        toast.success('Your student profile was updated successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      toast.error(err.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Academic Credentials & Placement Profile
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
          Manage Student Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Your CGPA, engineering branch, and graduation year determine your eligibility for campus drives.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Personal Information */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Personal Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <FormInput
              label="Email Address"
              value={user?.email || ''}
              disabled
              helperText="Institutional email managed by campus system."
            />

            <FormInput
              label="Contact Phone Number"
              placeholder="+91 98765 43210"
              value={profile.phone}
              onChange={(e) => handleProfileChange('phone', e.target.value)}
            />

            <FormInput
              label="Bio / Professional Summary"
              placeholder="Aspiring backend engineer with hands-on cloud experience..."
              value={profile.bio}
              onChange={(e) => handleProfileChange('bio', e.target.value)}
            />
          </div>
        </div>

        {/* Academic & Placement Eligibility Fields */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">
              Academic & Placement Eligibility
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FormInput
              label="College / Institute Name"
              placeholder="e.g. National Institute of Technology"
              value={profile.college}
              onChange={(e) => handleProfileChange('college', e.target.value)}
              required
            />

            <FormInput
              label="Degree"
              placeholder="e.g. B.Tech, M.Tech, MCA, B.Sc"
              value={profile.degree}
              onChange={(e) => handleProfileChange('degree', e.target.value)}
              required
            />

            <FormInput
              label="Branch / Major"
              placeholder="e.g. Computer Science and Engineering"
              value={profile.branch}
              onChange={(e) => handleProfileChange('branch', e.target.value)}
              helperText="Must match recruiter criteria (e.g. Computer Science, Information Technology)"
              required
            />

            <FormInput
              label="Graduation Year"
              type="number"
              placeholder="2026"
              value={profile.graduationYear}
              onChange={(e) => handleProfileChange('graduationYear', e.target.value)}
              required
            />

            <FormInput
              label="Cumulative CGPA (Scale of 10.0)"
              type="number"
              step="0.01"
              min="0"
              max="10"
              placeholder="e.g. 8.85"
              value={profile.cgpa}
              onChange={(e) => handleProfileChange('cgpa', e.target.value)}
              helperText="Verified academic CGPA without active backlogs."
              required
            />

            <div className="space-y-1.5">
              <FormInput
                label="Verified Resume Link (PDF / Cloud Storage)"
                placeholder="https://drive.google.com/file/d/... or portfolio"
                value={profile.resumeUrl}
                onChange={(e) => handleProfileChange('resumeUrl', e.target.value)}
                helperText="Ensure public link permissions are enabled for recruiters."
                required
              />
              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline pt-1"
                >
                  <span>Test Resume Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Technical Skills */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Technical Skills</h2>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. React, Node.js, Python, Docker (Press Enter to add)"
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

            {profile.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-800 text-xs font-semibold"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="text-indigo-400 hover:text-indigo-700 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No skills added yet.</p>
            )}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-semibold shadow-md shadow-indigo-100 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default StudentProfilePage;
