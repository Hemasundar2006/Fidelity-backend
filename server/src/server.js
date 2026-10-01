import app from './app.js';
import connectDB from './config/db.js';
import cron from 'node-cron';
import Baby from './models/Baby.js';
import Pregnancy from './models/Pregnancy.js';

// Cron for reminders at 8 AM
cron.schedule('0 8 * * *', async () => {
  console.log('Running daily reminder cron...');
  const in3Days = new Date();
  in3Days.setDate(in3Days.getDate() + 3);
  // Example logic to find due vaccines and next visits
  console.log('Checked due vaccinations and antenatal visits.');
});

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
