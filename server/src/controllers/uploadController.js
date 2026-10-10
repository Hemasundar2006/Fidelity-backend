import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getUploadSignature = asyncHandler(async (req, res) => {
  const { folder, type } = req.body; // e.g., folder: "fidelity/patients/MOM-2026-000001"
  
  const timestamp = Math.round((new Date).getTime() / 1000);
  const signature = cloudinary.utils.api_sign_request({
    timestamp,
    folder: folder || 'fidelity/misc'
  }, process.env.CLOUDINARY_API_SECRET);

  res.json({
    success: true,
    data: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      timestamp,
      signature,
      folder: folder || 'fidelity/misc',
      type: type || 'authenticated'
    }
  });
});
