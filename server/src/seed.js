import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import Patient from './models/Patient.js';
import Pregnancy from './models/Pregnancy.js';
import Delivery from './models/Delivery.js';
import Baby from './models/Baby.js';
import Counter from './models/Counter.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('DB Connected for Seeding');

  await User.deleteMany({});
  await Patient.deleteMany({});
  await Pregnancy.deleteMany({});
  await Delivery.deleteMany({});
  await Baby.deleteMany({});
  await Counter.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);

  const users = await User.insertMany([
    { name: 'Admin User', email: 'admin@fid.com', passwordHash, role: 'admin' }
  ]);

  

  console.log('Seeding completed');
  process.exit();
};

seed();
