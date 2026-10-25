import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { checkEligibility } from '../services/eligibilityService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getAllJobs = async (req, res, next) => {
  try {
    const {
      search,
      location,
      jobType,
      skills,
      status,
      mine,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const query = {};

    // By default, public & students can only view published jobs
    if (!req.user || req.user.role === 'student') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // If recruiter requests their own jobs
    if (mine === 'true' && req.user && req.user.role === 'recruiter') {
      query.recruiterId = req.user._id;
    }

    // Search by title or company using regex (safe pattern)
    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: sanitized, $options: 'i' } },
        { company: { $regex: sanitized, $options: 'i' } },
        { description: { $regex: sanitized, $options: 'i' } },
      ];
    }

    // Filter by location
    if (location && typeof location === 'string' && location.trim()) {
      query.location = { $regex: location.trim(), $options: 'i' };
    }

    // Filter by jobType
    if (jobType && typeof jobType === 'string' && jobType.trim() && jobType !== 'All') {
      query.jobType = jobType.trim();
    }

    // Filter by required skills
    if (skills && typeof skills === 'string' && skills.trim()) {
      const skillList = skills.split(',').map((s) => s.trim()).filter(Boolean);
      if (skillList.length > 0) {
        query.requiredSkills = { $in: skillList.map((s) => new RegExp(`^${s}$`, 'i')) };
      }
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortDirection = order === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDirection };

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiterId', 'name email profile.companyName')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

    // Attach application count to jobs if requested by recruiter/admin
    const jobsWithCounts = await Promise.all(
      jobs.map(async (job) => {
        const applicantCount = await Application.countDocuments({ jobId: job._id });
        return {
          ...job,
          applicantCount,
        };
      })
    );

    return sendSuccess(
      res,
      200,
      'Jobs retrieved successfully',
      { jobs: jobsWithCounts },
      {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }
    );
  } catch (error) {
    next(error);
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id).populate('recruiterId', 'name email profile.companyName profile.companyWebsite');

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // If job is draft/closed and user is public or student
    if (job.status !== 'published') {
      if (!req.user || (req.user.role === 'student' && req.user.role !== 'admin')) {
        if (!req.user || req.user._id.toString() !== job.recruiterId._id.toString()) {
          return sendError(res, 403, 'This job posting is not currently available.');
        }
      }
    }

    const applicantCount = await Application.countDocuments({ jobId: job._id });

    // If student is logged in, check if they already applied
    let studentApplication = null;
    let eligibility = null;
    if (req.user && req.user.role === 'student') {
      studentApplication = await Application.findOne({
        jobId: job._id,
        studentId: req.user._id,
      });
      eligibility = checkEligibility(req.user, job);
    }

    return sendSuccess(res, 200, 'Job details retrieved successfully', {
      job: {
        ...job.toObject(),
        applicantCount,
        studentApplication,
        eligibility,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req, res, next) => {
  try {
    const jobData = {
      ...req.body,
      recruiterId: req.user._id,
    };

    // If recruiter has companyName in profile and not provided in body, use it
    if (!jobData.company && req.user.profile?.companyName) {
      jobData.company = req.user.profile.companyName;
    }

    const job = await Job.create(jobData);
    return sendSuccess(res, 201, 'Job posting created successfully', { job });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // Recruiter ownership check
    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to update this job.');
    }

    Object.assign(job, req.body);
    await job.save();

    return sendSuccess(res, 200, 'Job updated successfully', { job });
  } catch (error) {
    next(error);
  }
};

export const publishJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to publish this job.');
    }

    job.status = 'published';
    await job.save();

    return sendSuccess(res, 200, 'Job published successfully', { job });
  } catch (error) {
    next(error);
  }
};

export const closeJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to close this job.');
    }

    job.status = 'closed';
    await job.save();

    return sendSuccess(res, 200, 'Job closed successfully', { job });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to delete this job.');
    }

    const applicationCount = await Application.countDocuments({ jobId: job._id });
    if (applicationCount > 0 && req.user.role !== 'admin') {
      return sendError(
        res,
        400,
        `Cannot delete this job because ${applicationCount} student(s) have already applied. You may close the job instead.`
      );
    }

    await Application.deleteMany({ jobId: job._id });
    await job.deleteOne();

    return sendSuccess(res, 200, 'Job deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const checkJobEligibilityEndpoint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    const result = checkEligibility(req.user, job);
    return sendSuccess(res, 200, 'Eligibility checked', result);
  } catch (error) {
    next(error);
  }
};

export const applyJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { resumeUrl, coverNote } = req.body;

    if (req.user.role !== 'student') {
      return sendError(res, 403, 'Only students can apply for campus placement jobs.');
    }

    const job = await Job.findById(id);
    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // Check if job is published and open
    if (job.status !== 'published') {
      return sendError(res, 400, `Cannot apply. Job is currently ${job.status}.`);
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return sendError(res, 400, 'Application deadline has passed.');
    }

    // Check eligibility
    const eligibilityResult = checkEligibility(req.user, job);
    if (!eligibilityResult.eligible) {
      return sendError(res, 422, 'You are not eligible to apply for this job.', {
        reasons: eligibilityResult.reasons,
      });
    }

    // Check duplicate
    const existing = await Application.findOne({
      jobId: job._id,
      studentId: req.user._id,
    });
    if (existing) {
      return sendError(res, 409, 'You have already applied for this job.');
    }

    const effectiveResumeUrl = resumeUrl || req.user.profile?.resumeUrl;
    if (!effectiveResumeUrl) {
      return sendError(res, 400, 'A valid resume link is required to apply.');
    }

    const application = await Application.create({
      jobId: job._id,
      studentId: req.user._id,
      resumeUrl: effectiveResumeUrl,
      coverNote: coverNote || '',
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          changedBy: req.user._id,
          note: 'Application submitted',
        },
      ],
    });

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title company location jobType')
      .populate('studentId', 'name email profile');

    return sendSuccess(res, 201, 'Application submitted successfully!', {
      application: populated,
    });
  } catch (error) {
    next(error);
  }
};
