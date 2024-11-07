import ContactCollection from '../db/models/Contact.js';

import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',

  filter = {}, // Додаємо фільтр
}) => {
  const skip = (page - 1) * perPage;

  // const data = await ContactCollection.find()
  //   .skip(skip)
  //   .limit(perPage)
  //   .sort({ [sortBy]: sortOrder });
  // Виконуємо запит з урахуванням фільтру
  const data = await ContactCollection.find(filter)
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  // const totalItems = await ContactCollection.countDocuments();
  const totalItems = await ContactCollection.countDocuments(filter); // Підраховуємо з урахуванням фільтру

  const paginationData = calculatePaginationData({ totalItems, page, perPage });

  return {
    data,
    ...paginationData,
  };
};

export const getContactById = (id) => ContactCollection.findById(id);

export const addContact = (payload) => ContactCollection.create(payload);

export const updateContact = async ({ _id, payload, options = {} }) => {
  const rawResult = await ContactCollection.findOneAndUpdate({ _id }, payload, {
    ...options,
    new: true,
    includeResultMetadata: true,
  });

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};

export const deleteContact = (filter) =>
  ContactCollection.findOneAndDelete(filter);
