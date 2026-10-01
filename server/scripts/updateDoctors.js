import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection;
  await db.collection('users').updateOne(
    { email: 'smith@fid.com' },
    { $set: { specialization: 'Senior Consultant - Obstetrics & High-Risk Pregnancy' } }
  );
  await db.collection('users').updateOne(
    { email: 'jones@fid.com' },
    { $set: { specialization: 'Consultant - Maternal-Fetal Medicine & Perinatology' } }
  );
  console.log('DOCTORS_UPDATED_SUCCESS');
  await mongoose.disconnect();
}

run().catch(console.error);
