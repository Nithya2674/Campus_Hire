import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      publishedJobs,
      totalApplications,
      statusCounts,
      recentApplications,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'recruiter' }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'published' }),
      Application.countDocuments(),
      Application.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
      Application.find()
        .populate('jobId', 'title company')
        .populate('studentId', 'name email profile.college profile.branch')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Job.find()
        .populate('recruiterId', 'name email')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    // Format status distribution
    const statusMap = {
      applied: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0,
      withdrawn: 0,
    };

    statusCounts.forEach((item) => {
      if (statusMap.hasOwnProperty(item._id)) {
        statusMap[item._id] = item.count;
      }
    });

    // Placement rate
    const distinctAppliedStudents = await Application.distinct('studentId');
    const selectedApplications = statusMap.selected;
    const placementRate =
      distinctAppliedStudents.length > 0
        ? Math.round((selectedApplications / distinctAppliedStudents.length) * 100)
        : 0;

    return sendSuccess(res, 200, 'Admin platform statistics', {
      totalStudents,
      totalRecruiters,
      totalJobs,
      publishedJobs,
      totalApplications,
      statusMap,
      placementRate,
      recentApplications,
      recentJobs,
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const { role, search, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role && ['student', 'recruiter', 'admin'].includes(role)) {
      query.role = role;
    }

    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;

    if (search && typeof search === 'string' && search.trim()) {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitized, $options: 'i' } },
        { email: { $regex: sanitized, $options: 'i' } },
        { 'profile.college': { $regex: sanitized, $options: 'i' } },
        { 'profile.companyName': { $regex: sanitized, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      User.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'User accounts retrieved',
      { users },
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

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return sendError(res, 400, 'Administrators cannot deactivate their own account.');
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, 404, 'User account not found');
    }

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(
      res,
      200,
      `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      { user: user.toJSON() }
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminJobs = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .populate('recruiterId', 'name email profile.companyName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Job.countDocuments(query),
    ]);

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
      'Platform jobs retrieved',
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

export const getAdminApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 25 } = req.query;

    const query = {};
    if (status) query.status = status;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 25));
    const skip = (pageNum - 1) * limitNum;

    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('jobId', 'title company location status')
        .populate('studentId', 'name email profile')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query),
    ]);

    return sendSuccess(
      res,
      200,
      'Platform applications retrieved',
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
