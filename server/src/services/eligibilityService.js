/**
 * Checks eligibility of a student user for a specific job.
 * 
 * Rules:
 * 1. User must be a student and active.
 * 2. Job must be published and not closed.
 * 3. Application deadline must not have passed.
 * 4. Profile completeness: CGPA, branch, graduationYear, and resumeUrl.
 * 5. If minCgpa is set (> 0), student's CGPA must meet or exceed minCgpa.
 * 6. If eligibleBranches are specified (array with items), student's branch must match (case-insensitive).
 * 7. If allowedGraduationYears are specified (array with items), student's graduationYear must be in the list.
 * 
 * Unspecified criteria are NOT treated as restrictions.
 * 
 * @param {Object} student - Populated User document with role 'student'
 * @param {Object} job - Job document
 * @returns {{ eligible: boolean, reasons: string[], profileIncomplete: boolean }}
 */
export const checkEligibility = (student, job) => {
  const reasons = [];
  let profileIncomplete = false;

  // 1. Status & Account checks
  if (!student) {
    return {
      eligible: false,
      reasons: ['Student record not found.'],
      profileIncomplete: false,
    };
  }

  if (student.role !== 'student') {
    return {
      eligible: false,
      reasons: ['Only students can check eligibility or apply for jobs.'],
      profileIncomplete: false,
    };
  }

  if (!student.isActive) {
    return {
      eligible: false,
      reasons: ['Your student account is currently deactivated.'],
      profileIncomplete: false,
    };
  }

  // 2. Job availability checks
  if (job.status !== 'published') {
    reasons.push(`This job is currently ${job.status} and not accepting applications.`);
  }

  const now = new Date();
  if (job.applicationDeadline && new Date(job.applicationDeadline) < now) {
    reasons.push('The application deadline for this job has passed.');
  }

  // 3. Student profile completeness
  const profile = student.profile || {};
  const missingFields = [];

  if (profile.cgpa === null || profile.cgpa === undefined || profile.cgpa === '') {
    missingFields.push('CGPA');
  }
  if (!profile.branch || !profile.branch.trim()) {
    missingFields.push('Branch/Major');
  }
  if (!profile.graduationYear) {
    missingFields.push('Graduation Year');
  }
  if (!profile.resumeUrl || !profile.resumeUrl.trim()) {
    missingFields.push('Resume Link');
  }

  if (missingFields.length > 0) {
    profileIncomplete = true;
    reasons.push(`Please complete your profile details first: missing ${missingFields.join(', ')}.`);
  }

  // 4. Academic eligibility checks (only if student provided the relevant fields)
  // CGPA Check
  const minCgpa = job.eligibility?.minCgpa || 0;
  if (minCgpa > 0) {
    if (profile.cgpa !== null && profile.cgpa !== undefined) {
      if (Number(profile.cgpa) < Number(minCgpa)) {
        reasons.push(`Minimum CGPA required is ${minCgpa.toFixed(2)}, but your CGPA is ${Number(profile.cgpa).toFixed(2)}.`);
      }
    }
  }

  // Branch Check
  const eligibleBranches = job.eligibility?.eligibleBranches || [];
  if (eligibleBranches.length > 0) {
    if (profile.branch) {
      const studentBranch = profile.branch.trim().toLowerCase();
      const matched = eligibleBranches.some(
        (b) => b.trim().toLowerCase() === studentBranch
      );
      if (!matched) {
        reasons.push(
          `Your branch (${profile.branch}) is not listed in eligible branches: ${eligibleBranches.join(', ')}.`
        );
      }
    }
  }

  // Graduation Year Check
  const allowedGraduationYears = job.eligibility?.allowedGraduationYears || [];
  if (allowedGraduationYears.length > 0) {
    if (profile.graduationYear) {
      const matched = allowedGraduationYears.includes(Number(profile.graduationYear));
      if (!matched) {
        reasons.push(
          `Your graduation year (${profile.graduationYear}) does not match allowed batches: ${allowedGraduationYears.join(', ')}.`
        );
      }
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons,
    profileIncomplete,
  };
};

export default { checkEligibility };
