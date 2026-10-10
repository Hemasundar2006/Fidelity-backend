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
  phone: z.string().min(10).max(15),
  email: z.string().email().optional().or(z.literal('')),
  abhaId: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional().or(z.literal('')),
  address: z.object({
    line1: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().optional(),
  }).optional(),
  partner: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    dob: z.string().or(z.date()).optional().or(z.literal('')),
    bloodGroup: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z.string().optional(),
    relation: z.string().optional(),
  }).optional(),
  medicalHistory: z.object({
    allergies: z.array(z.string()).or(z.string()).optional(),
    conditions: z.array(z.string()).or(z.string()).optional(),
    surgeries: z.array(z.string()).or(z.string()).optional(),
    medications: z.array(z.string()).or(z.string()).optional(),
  }).optional(),
  photo: z.object({
    publicId: z.string().optional(),
    url: z.string().optional(),
  }).optional().nullable(),
  idProof: z.object({
    type: z.string().optional(),
    publicId: z.string().optional(),
    url: z.string().optional(),
  }).optional().nullable(),
  consents: z.union([
    z.array(z.object({
      type: z.string(),
      granted: z.boolean(),
      method: z.string().optional()
    })),
    z.record(z.any())
  ]).optional()
});

export const validateRequest = (schema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues || error.errors || [];
      const details = issues.map(e => ({ field: (e.path || []).join('.'), issue: e.message }));
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details }
      });
    }
    next(error);
  }
};
