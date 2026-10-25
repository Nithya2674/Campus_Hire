import dotenv from 'dotenv';
dotenv.config();

import { connectDB, disconnectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campushire.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Campus2026!';
    const adminName = process.env.ADMIN_NAME || 'Platform Administrator';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Seed] Admin user already exists with email: ${adminEmail}`);
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log(`[Seed] Updated role to admin for: ${adminEmail}`);
      }
    } else {
      const passwordHash = await User.hashPassword(adminPassword);
      const admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: 'admin',
        isActive: true,
      });
      console.log(`[Seed] Admin user created successfully: ${admin.email}`);
    }

    console.log('[Seed] Admin seed finished.');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('[Seed] Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
