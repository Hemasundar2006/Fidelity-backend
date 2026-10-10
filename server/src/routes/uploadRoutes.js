import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js';
import { getUploadSignature, uploadDirect } from '../controllers/uploadController.js';

const router = express.Router();
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

router.post('/sign', protect, getUploadSignature);
router.post('/direct', protect, upload.single('file'), uploadDirect);

export default router;
