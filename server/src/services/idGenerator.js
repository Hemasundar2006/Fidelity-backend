import Counter from '../models/Counter.js';
import Patient from '../models/Patient.js';
import Baby from '../models/Baby.js';

export const generateId = async (prefix) => {
  const year = new Date().getFullYear();
  const counterId = `${prefix}_${year}`;
  
  while (true) {
    const counter = await Counter.findByIdAndUpdate(
      counterId,
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const seqStr = String(counter.seq).padStart(6, '0');
    const candidateId = `${prefix}-${year}-${seqStr}`;

    // Verify collision against manually seeded records
    let exists = false;
    if (prefix === 'MOM') {
      exists = await Patient.exists({ motherId: candidateId });
    } else if (prefix === 'BBY') {
      exists = await Baby.exists({ babyId: candidateId });
    }

    if (!exists) {
      return candidateId;
    }
  }
};
