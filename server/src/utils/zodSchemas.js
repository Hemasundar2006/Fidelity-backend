import { z } from 'zod';

export const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'receptionist', 'doctor', 'nurse', 'lab', 'pharmacy', 'patient']),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const patientSchema = z.object({
  name: z.string().min(1),
  dob: z.string().or(z.date()),
  gender: z.enum(['female']).optional(),
  phone: z.string().length(10),
  email: z.string().email().optional(),
  abhaId: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  partner: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().or(z.date()).optional(),
    bloodGroup: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).optional(),
    conditions: z.array(z.string()).optional(),
    surgeries: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
  }).optional(),
  photo: z.object({
    publicId: z.string(),
    url: z.string(),
  }).optional(),
  idProof: z.object({
    type: z.enum(['aadhaar', 'voter', 'other']),
    publicId: z.string(),
    url: z.string(),
  }).optional(),
  consents: z.array(z.object({
    type: z.enum(['treatment', 'data_sharing', 'ml_usage', 'baby_data_access']),
    granted: z.boolean(),
    method: z.enum(['in_person', 'portal']).optional()
  })).optional()
});

export const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map(e => ({ field: e.path.join('.'), issue: e.message }));
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details }
      });
    }
    next(error);
  }
};
