// import cloudinary from 'cloudinary';
// import fs from 'fs/promises';

// import { env } from './env.js';
// import { CLOUDINARY } from '../constants/index.js';

// cloudinary.v2.config({
//   secure: true,
//   cloud_name: env(CLOUDINARY.CLOUD_NAME),
//   api_key: env(CLOUDINARY.API_KEY),
//   api_secret: env(CLOUDINARY.API_SECRET),
// });

// export const saveFileToCloudinary = async (file) => {
//   const response = await cloudinary.v2.uploader.upload(file.path);
//   await fs.unlink(file.path);
//   return response.secure_url;
// };

import { v2 as cloudinary } from 'cloudinary';
import { unlink } from 'node:fs/promises';

import { env } from './env.js';

const cloud_name = env('CLOUD_NAME');
const api_key = env('API_KEY');
const api_secret = env('API_SECRET');

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export const saveFileToCloudinary = async (file, folder) => {
  try {
    const response = await cloudinary.uploader.upload(file.path, {
      folder,
    });
    console.log(response);
    return response.secure_url;
  } catch (err) {
    throw err;
  } finally {
    await unlink(file.path);
  }
};
