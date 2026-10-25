import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getMyApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = { studentId: req.user._id };
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'jobId',
          select: 'title company location jobType salaryRange status applicationDeadline requiredSkills',
          populate: { path: 'recruiterId', select: 'name email profile.companyName' },
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Student applications retrieved',
      { applications },
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

export const withdrawApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const application = await Application.findById(id).populate('jobId');

    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    // Ownership check: must be student's own application
    if (application.studentId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You can only withdraw your own applications.');
    }

    if (application.status === 'withdrawn') {
      return sendError(res, 400, 'This application has already been withdrawn.');
    }

    if (application.status === 'selected') {
      return sendError(res, 400, 'Cannot withdraw an application that has already received an offer / selection.');
    }

    application.status = 'withdrawn';
    application.statusHistory.push({
      status: 'withdrawn',
      changedAt: new Date(),
      changedBy: req.user._id,
      note: 'Withdrawn by student',
    });

    await application.save();

    return sendSuccess(res, 200, 'Application successfully withdrawn', {
      application,
    });
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { id: jobId } = req.params;
    const { status, search, page = 1, limit = 20 } = req.query;

    const job = await Job.findById(jobId);
    if (!job) {
      return sendError(res, 404, 'Job not found');
    }

    // Recruiter ownership check
    if (req.user.role === 'recruiter' && job.recruiterId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You do not have permission to view applicants for this job.');
    }

    const query = { jobId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    let applications = await Application.find(query)
      .populate('studentId', 'name email profile isActive createdAt')
      .populate('statusHistory.changedBy', 'name email role')
      .sort({ createdAt: -1 })
      .lean();

    // If search is provided, filter by student name or email or skills
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim().toLowerCase();
      applications = applications.filter((app) => {
        const student = app.studentId;
        if (!student) return false;
        const nameMatch = student.name?.toLowerCase().includes(q);
        const emailMatch = student.email?.toLowerCase().includes(q);
        const branchMatch = student.profile?.branch?.toLowerCase().includes(q);
        const skillMatch = student.profile?.skills?.some((s) => s.toLowerCase().includes(q));
        return nameMatch || emailMatch || branchMatch || skillMatch;
      });
    }

    const total = applications.length;
    const paginated = applications.slice(skip, skip + limitNum);

    // Summary counts for this job
    const allJobApps = await Application.find({ jobId }).select('status').lean();
    const statusCounts = {
      all: allJobApps.length,
      applied: allJobApps.filter((a) => a.status === 'applied').length,
      shortlisted: allJobApps.filter((a) => a.status === 'shortlisted').length,
      selected: allJobApps.filter((a) => a.status === 'selected').length,
      rejected: allJobApps.filter((a) => a.status === 'rejected').length,
      withdrawn: allJobApps.filter((a) => a.status === 'withdrawn').length,
    };

    return sendSuccess(
      res,
      200,
      'Job applicants retrieved',
      {
        job,
        applications: paginated,
        statusCounts,
      },
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

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    const application = await Application.findById(id).populate('jobId');
    if (!application) {
      return sendError(res, 404, 'Application not found');
    }

    // Recruiter ownership check
    if (
      req.user.role === 'recruiter' &&
      application.jobId.recruiterId.toString() !== req.user._id.toString()
    ) {
      return sendError(res, 403, 'You do not have permission to manage this application.');
    }

    // Prevent changing withdrawn applications
    if (application.status === 'withdrawn') {
      return sendError(res, 400, 'Cannot update the status of a withdrawn application.');
    }

    application.status = status;
    application.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user._id,
      note: note || `Status updated to ${status}`,
    });

    await application.save();

    const updated = await Application.findById(id)
      .populate('studentId', 'name email profile')
      .populate('jobId', 'title company');

    return sendSuccess(res, 200, `Application status updated to ${status}`, {
      application: updated,
    });
  } catch (error) {
    next(error);
  }
};
