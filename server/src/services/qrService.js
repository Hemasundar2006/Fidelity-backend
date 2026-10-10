import QRCode from 'qrcode';
import cloudinary from '../config/cloudinary.js';
import jwt from 'jsonwebtoken';

export const generateQR = async (id, folderPath) => {
  try {
    const qrImage = await QRCode.toDataURL(id);
    
    // Mock Cloudinary if not configured
    if (!process.env.CLOUDINARY_URL && !process.env.CLOUDINARY_API_KEY) {
      console.warn('Cloudinary not configured. Returning mock QR image.');
      return {
        publicId: `mock/${folderPath}/${id}`,
        url: qrImage
      };
    }

    const result = await cloudinary.uploader.upload(qrImage, {
      folder: folderPath,
      resource_type: 'image',
    });
    return {
      publicId: result.public_id,
      url: result.secure_url
    };
  } catch (error) {
    console.error('Error generating QR:', error);
    throw error;
  }
};

export const generateBabyQRToken = (babyId) => {
  return jwt.sign({ babyId }, process.env.QR_SECRET, { expiresIn: '10y' });
};
