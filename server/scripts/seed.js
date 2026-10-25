import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';
import Job from '../src/models/Job.js';
import Application from '../src/models/Application.js';

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('[Seed] Connected to database. Clearing existing collections...');

    await Promise.all([
      Application.deleteMany({}),
      Job.deleteMany({}),
      User.deleteMany({}),
    ]);

    const defaultPassword = 'Password@123';
    const passwordHash = await User.hashPassword(defaultPassword);
    const adminPasswordHash = await User.hashPassword(
      process.env.ADMIN_PASSWORD || 'Admin@Campus2026!'
    );

    console.log('[Seed] Creating demo users...');

    // 1. Admin
    const admin = await User.create({
      name: process.env.ADMIN_NAME || 'Platform Administrator',
      email: (process.env.ADMIN_EMAIL || 'admin@campushire.com').toLowerCase(),
      passwordHash: adminPasswordHash,
      role: 'admin',
      isActive: true,
      profile: {
        bio: 'Oversees campus placement drives and platform integrity.',
      },
    });

    // 2. Recruiters
    const googleRecruiter = await User.create({
      name: 'Sarah Jenkins',
      email: 'recruiter.google@campushire.com',
      passwordHash,
      role: 'recruiter',
      isActive: true,
      profile: {
        companyName: 'Google India',
        designation: 'University Talent Acquisition Lead',
        companyWebsite: 'https://careers.google.com',
        companyLocation: 'Bengaluru / Hyderabad',
        bio: 'Hiring exceptional engineers for Google India campus graduate cohorts.',
      },
    });

    const msftRecruiter = await User.create({
      name: 'David Chen',
      email: 'recruiter.msft@campushire.com',
      passwordHash,
      role: 'recruiter',
      isActive: true,
      profile: {
        companyName: 'Microsoft IDC',
        designation: 'Campus Hiring Specialist',
        companyWebsite: 'https://careers.microsoft.com',
        companyLocation: 'Hyderabad, India',
        bio: 'Connecting university talent to world-class cloud and systems engineering teams.',
      },
    });

    const credRecruiter = await User.create({
      name: 'Neha Roy',
      email: 'recruiter.cred@campushire.com',
      passwordHash,
      role: 'recruiter',
      isActive: true,
      profile: {
        companyName: 'CRED',
        designation: 'Head of Engineering Talent',
        companyWebsite: 'https://cred.club/careers',
        companyLocation: 'Bengaluru, India',
        bio: 'Building the best product & design engineering culture in fintech.',
      },
    });

    // 3. Students
    const studentArjun = await User.create({
      name: 'Arjun Sharma',
      email: 'arjun.sharma@college.edu',
      passwordHash,
      role: 'student',
      isActive: true,
      profile: {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 8.85,
        skills: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Docker', 'AWS'],
        resumeUrl: 'https://example.com/resumes/arjun_sharma.pdf',
        phone: '+91 98765 43210',
        bio: 'Full-stack developer passionate about distributed systems and cloud native architectures.',
      },
    });

    const studentPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@college.edu',
      passwordHash,
      role: 'student',
      isActive: true,
      profile: {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Information Technology',
        graduationYear: 2026,
        cgpa: 9.42,
        skills: ['Java', 'Spring Boot', 'React', 'Microservices', 'Kubernetes', 'PostgreSQL'],
        resumeUrl: 'https://example.com/resumes/priya_patel.pdf',
        phone: '+91 98765 43211',
        bio: 'Competitive programmer and backend specialist. Ranked top 1% in university hackathons.',
      },
    });

    const studentRahul = await User.create({
      name: 'Rahul Verma',
      email: 'rahul.verma@college.edu',
      passwordHash,
      role: 'student',
      isActive: true,
      profile: {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Electronics and Communication',
        graduationYear: 2025,
        cgpa: 6.85,
        skills: ['C++', 'Python', 'IoT', 'Embedded Systems', 'Git'],
        resumeUrl: 'https://example.com/resumes/rahul_verma.pdf',
        phone: '+91 98765 43212',
        bio: 'Hardware-software co-design enthusiast with focus on robotics and embedded devices.',
      },
    });

    const studentAnanya = await User.create({
      name: 'Ananya Sen',
      email: 'ananya.sen@college.edu',
      passwordHash,
      role: 'student',
      isActive: true,
      profile: {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Computer Science and Engineering',
        graduationYear: 2026,
        cgpa: 7.95,
        skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science', 'SQL'],
        resumeUrl: 'https://example.com/resumes/ananya_sen.pdf',
        phone: '+91 98765 43213',
        bio: 'AI researcher and data analyst looking for challenging engineering roles.',
      },
    });

    const studentVikram = await User.create({
      name: 'Vikram Nair',
      email: 'vikram.nair@college.edu',
      passwordHash,
      role: 'student',
      isActive: true,
      profile: {
        college: 'National Institute of Technology',
        degree: 'B.Tech',
        branch: 'Mechanical Engineering',
        graduationYear: 2026,
        cgpa: 5.9,
        skills: ['AutoCAD', 'SolidWorks', 'Python Basics'],
        resumeUrl: 'https://example.com/resumes/vikram_nair.pdf',
        phone: '+91 98765 43214',
        bio: 'Mechanical engineering senior with interdisciplinary computing interests.',
      },
    });

    console.log('[Seed] Creating demo job postings...');

    // Future deadline 30 days from now
    const futureDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    // Passed deadline for closed job
    const pastDeadline = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    const job1 = await Job.create({
      title: 'Software Development Engineer - Campus 2026',
      company: 'Google India',
      description:
        'Join Google as an SDE Graduate to build scalable solutions that impact billions of global users. You will work on massive-scale distributed databases, AI-powered applications, and world-class developer infrastructure. Candidates must have strong problem-solving skills and mastery over data structures & algorithms.',
      location: 'Bengaluru / Hyderabad',
      jobType: 'Full-time',
      salaryRange: '₹28 - 34 LPA',
      requiredSkills: ['Data Structures', 'Algorithms', 'C++', 'Java', 'Python', 'Distributed Systems'],
      eligibility: {
        minCgpa: 8.0,
        eligibleBranches: ['Computer Science and Engineering', 'Information Technology'],
        allowedGraduationYears: [2026],
      },
      recruiterId: googleRecruiter._id,
      status: 'published',
      applicationDeadline: futureDeadline,
    });

    const job2 = await Job.create({
      title: 'Cloud Solutions Engineer',
      company: 'Microsoft IDC',
      description:
        'Microsoft IDC is seeking proactive Cloud Solutions Engineers to accelerate enterprise migrations to Microsoft Azure. You will architect resilient distributed clouds, automate DevOps pipelines, and work side-by-side with principal cloud architects on real-world mission-critical platforms.',
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      salaryRange: '₹22 - 26 LPA',
      requiredSkills: ['Azure', 'Cloud Computing', 'Docker', 'Kubernetes', 'Networking', 'Python'],
      eligibility: {
        minCgpa: 7.5,
        eligibleBranches: [
          'Computer Science and Engineering',
          'Information Technology',
          'Electronics and Communication',
        ],
        allowedGraduationYears: [2025, 2026],
      },
      recruiterId: msftRecruiter._id,
      status: 'published',
      applicationDeadline: futureDeadline,
    });

    const job3 = await Job.create({
      title: 'Frontend Product Engineer Intern',
      company: 'CRED',
      description:
        'At CRED, design and performance are first-class engineering principles. We are looking for high-craft frontend interns who obsess over 60fps animations, accessible micro-interactions, responsive CSS layouts, and modern React architectures.',
      location: 'Bengaluru, India',
      jobType: 'Internship',
      salaryRange: '₹75,000 / month Stipend',
      requiredSkills: ['React', 'JavaScript', 'CSS', 'Tailwind CSS', 'Web Performance'],
      eligibility: {
        minCgpa: 7.0,
        eligibleBranches: [], // open to all branches
        allowedGraduationYears: [2026],
      },
      recruiterId: credRecruiter._id,
      status: 'published',
      applicationDeadline: futureDeadline,
    });

    const job4 = await Job.create({
      title: 'Systems & Firmware Engineer',
      company: 'Microsoft IDC',
      description:
        'Develop low-level firmware and kernel drivers for Microsoft hardware and Azure host hypervisors. Deep understanding of operating systems, hardware virtualization, and C/C++ memory models required.',
      location: 'Hyderabad, India',
      jobType: 'Full-time',
      salaryRange: '₹20 - 24 LPA',
      requiredSkills: ['C', 'C++', 'Operating Systems', 'Kernel Programming'],
      eligibility: {
        minCgpa: 7.0,
        eligibleBranches: ['Electronics and Communication', 'Computer Science and Engineering'],
        allowedGraduationYears: [2025, 2026],
      },
      recruiterId: msftRecruiter._id,
      status: 'closed',
      applicationDeadline: pastDeadline,
    });

    const job5 = await Job.create({
      title: 'Full Stack Associate (Upcoming Drive)',
      company: 'Google India',
      description:
        'Preliminary draft for the upcoming winter campus placement drive. Focuses on full-stack web applications and internal tools.',
      location: 'Bengaluru, India',
      jobType: 'Full-time',
      salaryRange: '₹24 - 28 LPA',
      requiredSkills: ['React', 'Node.js', 'Go', 'GCP'],
      eligibility: {
        minCgpa: 8.5,
        eligibleBranches: ['Computer Science and Engineering'],
        allowedGraduationYears: [2026],
      },
      recruiterId: googleRecruiter._id,
      status: 'draft',
      applicationDeadline: futureDeadline,
    });

    console.log('[Seed] Creating demo applications...');

    // Priya -> Google SDE (Selected)
    await Application.create({
      jobId: job1._id,
      studentId: studentPriya._id,
      resumeUrl: studentPriya.profile.resumeUrl,
      coverNote: 'Excited about large-scale backend systems at Google.',
      status: 'selected',
      appliedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), note: 'Applied via CampusHire' },
        { status: 'shortlisted', changedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), note: 'Cleared technical interview round' },
        { status: 'selected', changedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), note: 'Offer letter extended!' },
      ],
    });

    // Arjun -> Google SDE (Shortlisted)
    await Application.create({
      jobId: job1._id,
      studentId: studentArjun._id,
      resumeUrl: studentArjun.profile.resumeUrl,
      coverNote: 'Strong background in cloud native engineering and distributed architectures.',
      status: 'shortlisted',
      appliedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), note: 'Applied via CampusHire' },
        { status: 'shortlisted', changedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), note: 'Shortlisted for technical screening' },
      ],
    });

    // Ananya -> CRED Frontend (Applied)
    await Application.create({
      jobId: job3._id,
      studentId: studentAnanya._id,
      resumeUrl: studentAnanya.profile.resumeUrl,
      coverNote: 'Enthusiastic about building pixel-perfect high performance user interfaces.',
      status: 'applied',
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), note: 'Application received' },
      ],
    });

    // Rahul -> Microsoft Cloud (Rejected - did not meet CGPA minimum of 7.5)
    await Application.create({
      jobId: job2._id,
      studentId: studentRahul._id,
      resumeUrl: studentRahul.profile.resumeUrl,
      coverNote: 'Interested in cloud infrastructure.',
      status: 'rejected',
      appliedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: 'applied', changedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), note: 'Applied via CampusHire' },
        { status: 'rejected', changedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), note: 'Did not meet criteria' },
      ],
    });

    console.log('------------------------------------------------------------');
    console.log('✅ CampusHire Database Seed Completed Successfully!');
    console.log('------------------------------------------------------------');
    console.log('Demo Credentials for Testing:');
    console.log('1. Administrator:');
    console.log(`   Email:    admin@campushire.com`);
    console.log(`   Password: Admin@Campus2026!`);
    console.log('2. Recruiter (Google India):');
    console.log(`   Email:    recruiter.google@campushire.com`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('3. Recruiter (Microsoft IDC):');
    console.log(`   Email:    recruiter.msft@campushire.com`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('4. Student (Eligible for Google/CRED, CGPA 8.85):');
    console.log(`   Email:    arjun.sharma@college.edu`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('5. Student (Selected for Google, CGPA 9.42):');
    console.log(`   Email:    priya.patel@college.edu`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('6. Student (Low CGPA 5.9, Mechanical - Ineligible test):');
    console.log(`   Email:    vikram.nair@college.edu`);
    console.log(`   Password: ${defaultPassword}`);
    console.log('------------------------------------------------------------');

    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
