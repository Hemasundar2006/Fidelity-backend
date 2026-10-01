import QRCode from 'qrcode';
import { v2 as cloudinary } from 'cloudinary';
import jwt from 'jsonwebtoken';

export const generateQR = async (id, folderPath) => {
  try {
    const qrImage = await QRCode.toDataURL(id);
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
