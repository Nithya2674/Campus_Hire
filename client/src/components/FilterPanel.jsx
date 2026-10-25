import React from 'react';
import { RotateCcw } from 'lucide-react';

export const FilterPanel = ({
  filters,
  onChange,
  onReset,
  className = '',
}) => {
  const jobTypes = ['All', 'Full-time', 'Internship', 'Part-time', 'Contract'];
  const popularSkills = ['React', 'Node.js', 'Python', 'Java', 'Docker', 'AWS', 'SQL'];

  const handleSkillToggle = (skill) => {
    const current = filters.skills ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean) : [];
    let updated;
    if (current.includes(skill)) {
      updated = current.filter((s) => s !== skill);
    } else {
      updated = [...current, skill];
    }
    onChange({ ...filters, skills: updated.join(',') });
  };

  const selectedSkills = filters.skills
    ? filters.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h4 className="text-sm font-semibold text-slate-900">Filter Job Postings</h4>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 font-medium transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset All
        </button>
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Job Type
        </label>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ ...filters, jobType: type === 'All' ? '' : type })}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                (type === 'All' && !filters.jobType) || filters.jobType === type
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Location
        </label>
        <input
          type="text"
          value={filters.location || ''}
          onChange={(e) => onChange({ ...filters, location: e.target.value })}
          placeholder="e.g. Bengaluru, Hyderabad, Remote"
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Required Skills
        </label>
        <div className="flex flex-wrap gap-1.5">
          {popularSkills.map((skill) => {
            const isSelected = selectedSkills.includes(skill);
            return (
              <button
                key={skill}
                type="button"
                onClick={() => handleSkillToggle(skill)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
                  isSelected
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-300'
                    : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {skill}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5 pt-2 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
          Sort Order
        </label>
        <select
          value={`${filters.sortBy || 'createdAt'}-${filters.order || 'desc'}`}
          onChange={(e) => {
            const [sortBy, order] = e.target.value.split('-');
            onChange({ ...filters, sortBy, order });
          }}
          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
        >
          <option value="createdAt-desc">Newest Postings First</option>
          <option value="createdAt-asc">Oldest Postings First</option>
          <option value="applicationDeadline-asc">Closing Soonest First</option>
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
