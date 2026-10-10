import express from 'express';
import { protect, authorize, checkConsent } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { 
  registerPatient, getPatients, getPatientById, updatePatient,
  getPatientTimeline, getPatientSummary, getAccessLog,
  addConsent, removeConsent, addVisit, getVisits,
  addReport, getReports, checkDuplicateTest,
  addPregnancy, loginPatient
} from '../controllers/patientController.js';
import { validateRequest, patientSchema } from '../utils/zodSchemas.js';

const router = express.Router();

router.post('/login', loginPatient);

router.route('/')
  .post(protect, authorize('admin', 'receptionist'), validateRequest(patientSchema), auditMiddleware('create', 'Patient'), registerPatient)
  .get(protect, authorize('admin', 'receptionist', 'doctor', 'nurse', 'lab', 'pharmacy'), getPatients);

router.route('/:id')
  .get(protect, checkConsent('treatment'), auditMiddleware('read', 'Patient'), getPatientById)
  .patch(protect, authorize('superadmin', 'admin', 'receptionist', 'doctor', 'nurse', 'lab'), auditMiddleware('update', 'Patient'), updatePatient);

router.get('/:id/timeline', protect, checkConsent('treatment'), auditMiddleware('read', 'PatientTimeline'), getPatientTimeline);
router.get('/:id/summary', protect, checkConsent('ml_usage'), auditMiddleware('read', 'PatientSummary'), getPatientSummary);
router.get('/:id/access-log', protect, getAccessLog);

router.post('/:id/consents', protect, authorize('admin', 'receptionist', 'patient'), auditMiddleware('consent_change', 'Patient'), addConsent);
router.delete('/:id/consents/:consentId', protect, authorize('admin', 'receptionist', 'patient'), auditMiddleware('consent_change', 'Patient'), removeConsent);

router.post('/:id/visits', protect, authorize('admin', 'doctor', 'nurse'), auditMiddleware('create', 'Visit'), addVisit);
router.get('/:id/visits', protect, checkConsent('treatment'), auditMiddleware('read', 'Visit'), getVisits);

router.post('/:id/reports', protect, authorize('superadmin', 'admin', 'doctor', 'nurse', 'lab', 'receptionist'), auditMiddleware('create', 'LabReport'), addReport);
router.get('/:id/reports', protect, checkConsent('treatment'), auditMiddleware('read', 'LabReport'), getReports);
router.get('/:id/reports/check', protect, authorize('superadmin', 'admin', 'doctor', 'nurse', 'lab', 'receptionist'), checkDuplicateTest);

router.post('/:id/pregnancies', protect, authorize('doctor'), auditMiddleware('create', 'Pregnancy'), addPregnancy);

export default router;
