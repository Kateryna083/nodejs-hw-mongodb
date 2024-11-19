import createHttpError from 'http-errors';

import * as contactServicer from '../services/contacts.js';

import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseContactFilterParams } from '../utils/parseContactFilterParams.js';

import { sortByList } from '../db/models/Contact.js';

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
  const data = await contactServicer.getContactById(id);

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
  const { _id: userId } = req.user;

  // console.log('addContactController - req.body:', req.body); //перевірка
  // console.log('addContactController - userId:', userId); //перевірка

  const data = await contactServicer.addContact({ ...req.body, userId });

  // console.log('addContactController - created data:', data);

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

export const patchContactController = async (req, res) => {
  const { id: _id } = req.params;

  const result = await contactServicer.updateContact({
    _id,
    payload: req.body,
  });

  if (!result) {
    throw createHttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: 'Successfully patched a contact!',
    data: result.data,
  });
};

export const deleteContactController = async (req, res) => {
  const { id: _id } = req.params;

  const data = await contactServicer.deleteContact({ _id });

  if (!data) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(204).send();
};
