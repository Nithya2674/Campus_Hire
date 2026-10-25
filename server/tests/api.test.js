import { describe, it, beforeAll, afterAll, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Job from '../src/models/Job.js';
import Application from '../src/models/Application.js';

describe('CampusHire Full Backend API Tests', () => {
  let app;
  let studentToken;
  let studentUser;
  let ineligibleStudentToken;
  let ineligibleStudentUser;
  let recruiterToken;
  let recruiterUser;
  let otherRecruiterToken;
  let testJobId;
  let closedJobId;
  let testApplicationId;

  beforeAll(async () => {
    await connectDB();
    app = createApp();

    // Clean test database
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
  });

  afterAll(async () => {
    await Application.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});
    await disconnectDB();
  });

  describe('1. Health Check Endpoint', () => {
    it('GET /api/health should return status UP', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('UP');
      expect(res.body.service).toBe('CampusHire API');
    });
  });

  describe('2. Authentication & Authorization', () => {
    it('POST /api/auth/register should register a new student successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student',
          email: 'test.student@college.edu',
          password: 'Password123!',
          role: 'student',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('test.student@college.edu');
      expect(res.body.data.token).toBeDefined();

      studentToken = res.body.data.token;
      studentUser = res.body.data.user;
    });

    it('POST /api/auth/register should reject registration with role admin', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Hacker Admin',
          email: 'hacker@campushire.com',
          password: 'Password123!',
          role: 'admin',
        });

      expect([400, 403]).toContain(res.status);
      expect(res.body.success).toBe(false);
    });

    it('POST /api/auth/register should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Student Duplicate',
          email: 'test.student@college.edu',
          password: 'Password123!',
          role: 'student',
        });

      expect(res.status).toBe(409);
    });

    it('POST /api/auth/login should log in existing user with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@college.edu',
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
    });

    it('POST /api/auth/login should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test.student@college.edu',
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('GET /api/auth/me should reject request without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('GET /api/auth/me should return authenticated user details with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.email).toBe('test.student@college.edu');
    });
  });

  describe('3. Recruiter Job Management & Access Control', () => {
    beforeAll(async () => {
      // Register recruiter 1
      const rec1 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Alpha Recruiter',
          email: 'recruiter.alpha@company.com',
          password: 'Password123!',
          role: 'recruiter',
          companyName: 'Alpha Corp',
        });
      recruiterToken = rec1.body.data.token;
      recruiterUser = rec1.body.data.user;

      // Register recruiter 2
      const rec2 = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Beta Recruiter',
          email: 'recruiter.beta@company.com',
          password: 'Password123!',
          role: 'recruiter',
          companyName: 'Beta Corp',
        });
      otherRecruiterToken = rec2.body.data.token;

      // Register an ineligible student (Low CGPA 5.0)
      const inelig = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Low Cgpa Student',
          email: 'lowcgpa@college.edu',
          password: 'Password123!',
          role: 'student',
        });
      ineligibleStudentToken = inelig.body.data.token;
      ineligibleStudentUser = inelig.body.data.user;

      // Update eligible student profile
      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          profile: {
            college: 'Tech University',
            degree: 'B.Tech',
            branch: 'Computer Science',
            graduationYear: 2026,
            cgpa: 8.5,
            skills: ['React', 'Node.js', 'Python'],
            resumeUrl: 'https://example.com/resume.pdf',
          },
        });

      // Update ineligible student profile
      await request(app)
        .patch('/api/users/me')
        .set('Authorization', `Bearer ${ineligibleStudentToken}`)
        .send({
          profile: {
            college: 'Tech University',
            degree: 'B.Tech',
            branch: 'Civil Engineering',
            graduationYear: 2024,
            cgpa: 5.2,
            skills: ['AutoCAD'],
            resumeUrl: 'https://example.com/civil_resume.pdf',
          },
        });
    });

    it('Student should NOT be able to create a job (403 Forbidden)', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          title: 'Unauthorized Job',
          company: 'Fake Corp',
          description: 'This should fail',
          location: 'Remote',
          jobType: 'Full-time',
          applicationDeadline: new Date(Date.now() + 86400000).toISOString(),
        });

      expect(res.status).toBe(403);
    });

    it('Recruiter should be able to create a published job with eligibility criteria', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Software Engineer',
          company: 'Alpha Corp',
          description: 'Excellent software engineering position building scalable distributed web services.',
          location: 'Bengaluru',
          jobType: 'Full-time',
          salaryRange: '₹18 - 22 LPA',
          requiredSkills: ['React', 'Node.js'],
          eligibility: {
            minCgpa: 7.5,
            eligibleBranches: ['Computer Science', 'Information Technology'],
            allowedGraduationYears: [2026],
          },
          status: 'published',
          applicationDeadline: new Date(Date.now() + 7 * 86400000).toISOString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.job._id).toBeDefined();
      testJobId = res.body.data.job._id;
    });

    it('Another recruiter should NOT be able to modify recruiter 1’s job (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${otherRecruiterToken}`)
        .send({
          title: 'Hacked Title',
        });

      expect(res.status).toBe(403);
    });

    it('Recruiter should be able to create a closed job for testing deadline/status checks', async () => {
      const res = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Closed Position',
          company: 'Alpha Corp',
          description: 'This position is already closed.',
          location: 'Bengaluru',
          jobType: 'Full-time',
          eligibility: { minCgpa: 6.0 },
          status: 'closed',
          applicationDeadline: new Date(Date.now() - 86400000).toISOString(),
        });

      expect(res.status).toBe(201);
      closedJobId = res.body.data.job._id;
    });
  });

  describe('4. Eligibility and Application Logic', () => {
    it('Ineligible student should fail eligibility check with clear reasons', async () => {
      const res = await request(app)
        .get(`/api/jobs/${testJobId}/eligibility`)
        .set('Authorization', `Bearer ${ineligibleStudentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.eligible).toBe(false);
      expect(res.body.data.reasons.length).toBeGreaterThan(0);
    });

    it('Ineligible student should be rejected when attempting to apply (422 Unprocessable Entity)', async () => {
      const res = await request(app)
        .post(`/api/jobs/${testJobId}/apply`)
        .set('Authorization', `Bearer ${ineligibleStudentToken}`)
        .send({
          resumeUrl: 'https://example.com/civil_resume.pdf',
        });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('Student cannot apply to a closed or expired job (400 Bad Request)', async () => {
      const res = await request(app)
        .post(`/api/jobs/${closedJobId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          resumeUrl: 'https://example.com/resume.pdf',
        });

      expect(res.status).toBe(400);
    });

    it('Eligible student should be able to submit an application successfully', async () => {
      const res = await request(app)
        .post(`/api/jobs/${testJobId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          resumeUrl: 'https://example.com/resume.pdf',
          coverNote: 'Excited to apply for Alpha Corp!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.application._id).toBeDefined();
      expect(res.body.data.application.status).toBe('applied');

      testApplicationId = res.body.data.application._id;
    });

    it('Duplicate application by same student should be rejected (409 Conflict)', async () => {
      const res = await request(app)
        .post(`/api/jobs/${testJobId}/apply`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          resumeUrl: 'https://example.com/resume.pdf',
        });

      expect(res.status).toBe(409);
    });

    it('Student should NOT be able to change application status directly (403 Forbidden)', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          status: 'selected',
        });

      expect(res.status).toBe(403);
    });

    it('Recruiter should be able to update application status for their job', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'shortlisted',
          note: 'Impressive GitHub projects',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.application.status).toBe('shortlisted');
    });

    it('Student can withdraw their own application', async () => {
      const res = await request(app)
        .patch(`/api/applications/${testApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.application.status).toBe('withdrawn');
    });
  });
});
