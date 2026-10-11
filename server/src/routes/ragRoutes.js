import express from 'express';
import { predictReport, ragChat, ragPersonalPatientChat, getKnowledgeBaseReference, readPrescription } from '../controllers/ragController.js';

const router = express.Router();

// Public / Authenticated endpoints for RAG predictions and voice/text assistance
router.post('/predict-report', predictReport);
router.post('/chat', ragChat);
router.post('/patient-chat', ragPersonalPatientChat);
router.get('/reference', getKnowledgeBaseReference);

// Prescription Reader - Gemini Vision based trilingual analysis
router.post('/prescription-read', readPrescription);

export default router;
