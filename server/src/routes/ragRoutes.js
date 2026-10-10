import express from 'express';
import { predictReport, ragChat, ragPersonalPatientChat, getKnowledgeBaseReference } from '../controllers/ragController.js';

const router = express.Router();

// Public / Authenticated endpoints for RAG predictions and voice/text assistance
router.post('/predict-report', predictReport);
router.post('/chat', ragChat);
router.post('/patient-chat', ragPersonalPatientChat);
router.get('/reference', getKnowledgeBaseReference);

export default router;
