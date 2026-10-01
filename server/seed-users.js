import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  passwordHash: String,
  role: String,
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false }
});

const User = mongoose.model('User', userSchema);

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const pw = await bcrypt.hash('password123', 10);
    
    // Check if demo users exist
    const count = await User.countDocuments({ email: { $in: ['admin@fid.com', 'kate@fid.com', 'smith@fid.com', 'joy@fid.com', 'lab@fid.com', 'pharmacy@fid.com'] }});
    
    if (count > 0) {
      console.log('Demo users already exist.');
    } else {
      console.log('Inserting demo users...');
      await User.insertMany([
        { name: 'System Admin', email: 'admin@fid.com', passwordHash: pw, role: 'admin' },
        { name: 'Kate (Receptionist)', email: 'kate@fid.com', passwordHash: pw, role: 'receptionist' },
        { name: 'Dr. Smith (OB)', email: 'smith@fid.com', passwordHash: pw, role: 'doctor' },
        { name: 'Nurse Joy', email: 'joy@fid.com', passwordHash: pw, role: 'nurse' },
        { name: 'Lab Technician', email: 'lab@fid.com', passwordHash: pw, role: 'lab' },
        { name: 'Pharmacist', email: 'pharmacy@fid.com', passwordHash: pw, role: 'pharmacy' }
      ]);
      console.log('Demo users seeded successfully!');
    }
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
