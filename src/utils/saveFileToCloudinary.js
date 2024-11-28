import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises';
import { env } from './env.js';

const cloud_name = env('CLOUD_NAME');
const api_key = env('API_KEY');
const api_secret = env('API_SECRET');

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
});

export const saveFileToCloudinary = async (file) => {
  try {
    // Завантажуємо файл на Cloudinary
    const response = await cloudinary.uploader.upload(file.path);

    // Видаляємо файл з локального сервера після завантаження
    await fs.unlink(file.path);

    // Повертаємо URL завантаженого фото
    return response.secure_url;
  } catch (error) {
    console.error('Помилка завантаження на Cloudinary:', error);
    throw new Error('Не вдалося завантажити фото на Cloudinary');
  }
};
