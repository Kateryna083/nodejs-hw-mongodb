import createHttpError from 'http-errors';
// import * as path from 'node:path';
import fs from 'fs/promises';

import * as contactServicer from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilterParams } from '../utils/parseContactFilterParams.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
// import { env } from '../utils/env.js';

import { sortByList } from '../db/models/Contact.js';

// const enableCloudinary = env('ENABLE_CLOUDINARY');

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query, sortByList);
  const filter = parseContactFilterParams(req.query);
  const { _id: userId } = req.user;
  filter.userId = userId;

  const data = await contactServicer.getContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filter,
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
};

export const getContactByIdController = async (req, res) => {
  const { id } = req.params;

  const { _id: userId } = req.user;

  const data = await contactServicer.getContactById({ id, userId });

  if (!data) {
    throw createHttpError(404, `Contact with id=${id} not found`);
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data,
  });
};

export const addContactController = async (req, res) => {
  console.log('Фото у запиті:', req.file); // Логування фото
  const { _id: userId } = req.user;
  const photo = req.file;
  let photoUrl;

  // Якщо файл фото є в запиті
  if (photo) {
    // Завантажуємо фото на Cloudinary
    photoUrl = await saveFileToCloudinary(photo);
  }

  // console.log('URL завантаженого фото:', photoUrl);

  // Додаємо контакт до бази даних, включаючи URL фото
  const data = await contactServicer.addContact({
    ...req.body,
    userId,
    photo: photoUrl, // Зберігаємо посилання на фото
  });

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data,
  });
};

export const upsertContactController = async (req, res) => {
  const { id: _id } = req.params;

  const result = await contactServicer.updateContact({
    _id,
    payload: req.body,
    options: {
      upsert: true,
    },
  });

  const status = result.isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: 'Contact upserted successfully',
    data: result.data,
  });
};

export const patchContactController = async (req, res, next) => {
  const { id: _id } = req.params;

  const { _id: userId } = req.user;

  const photo = req.file;
  let photoUrl;
  if (photo) {
    photoUrl = await saveFileToCloudinary(photo);
  }

  // const result = await contactServicer.updateContact(_id, userId, {
  //   ...req.body,
  //   photo: photoUrl,
  // });

  // Оновлення контакту
  const result = await contactServicer.updateContact({
    _id,
    userId,
    payload: { ...req.body, photo: photoUrl },
    options: { new: true },
  });

  if (!result) {
    next(
      createHttpError(
        404,
        'Contact not found or does not belong to the logged-in user',
      ),
    );
    return;
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.data,
  });
};

export const deleteContactController = async (req, res) => {
  const { id: _id } = req.params;

  const { _id: userId } = req.user;

  const data = await contactServicer.deleteContact({ _id, userId });

  if (!data) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
