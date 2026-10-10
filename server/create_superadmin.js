import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './src/models/User.js';
import dotenv from 'dotenv';
dotenv.config();

async function createSuperAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const email = 'superadmin@janmalink.com';
  const password = 'superadmin123';
  
  const existing = await User.findOne({ email });
  if (existing) {
    console.log('Superadmin already exists. Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
  } else {
    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({
      name: 'System Super Admin',
      email: email,
      passwordHash: passwordHash,
      role: 'superadmin',
      isApproved: true,
      isActive: true
    });
    console.log('Superadmin created successfully. Credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
  }
  
  mongoose.disconnect();
}
createSuperAdmin();
