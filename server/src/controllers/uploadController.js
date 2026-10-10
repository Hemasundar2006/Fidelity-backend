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

export const uploadDirect = asyncHandler(async (req, res) => {
  const folder = req.body.folder || 'fidelity/reports';

  if (req.file) {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    try {
      const result = await cloudinary.uploader.upload(dataURI, {
        folder,
        resource_type: 'auto'
      });
      return res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes
        }
      });
    } catch (cErr) {
      console.warn('Cloudinary upload warning:', cErr.message);
      return res.json({
        success: true,
        data: {
          url: dataURI,
          publicId: 'local-' + Date.now(),
          format: req.file.mimetype,
          bytes: req.file.size
        }
      });
    }
  } else if (req.body.fileBase64) {
    try {
      const result = await cloudinary.uploader.upload(req.body.fileBase64, {
        folder,
        resource_type: 'auto'
      });
      return res.json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes
        }
      });
    } catch (cErr) {
      return res.json({
        success: true,
        data: {
          url: req.body.fileBase64,
          publicId: 'local-' + Date.now(),
          format: 'image/png',
          bytes: req.body.fileBase64.length
        }
      });
    }
  }

  return res.status(400).json({ success: false, message: 'No file or fileBase64 provided' });
});
