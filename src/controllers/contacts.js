import createHttpError from 'http-errors';

import * as contactServicer from '../services/contacts.js';

export const getContactsController = async (req, res) => {
  const data = await contactServicer.getContacts();

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
    throw createHttpError(404, `Contact not found`);
  }
  res.json({
    status: 200,
    message: `Successfully found contact with id ${id}!`,
    data,
  });
};
