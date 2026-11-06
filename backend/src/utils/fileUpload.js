import cloudinary from '../config/cloudinary.js';

export const uploadToCloudinary = async (fileBuffer, folder = 'worksync') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

export default uploadToCloudinary;

