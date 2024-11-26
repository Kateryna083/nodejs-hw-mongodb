import ContactCollection from '../db/models/Contact.js';

import { calculatePaginationData } from '../utils/calculatePaginationData.js';

export const getContacts = async ({
  page = 1,
  perPage = 10,
  sortBy = '_id',
  sortOrder = 'asc',
  filter = {},
}) => {
  const query = ContactCollection.find();

  if (filter.contactType) {
    query.where('contactType').equals(filter.contactType);
  }
  if (filter.isFavourite !== undefined) {
    query.where('isFavourite').equals(filter.isFavourite);
  }
  if (filter.userId) {
    query.where('userId').equals(filter.userId);
  }

  const totalItems = await ContactCollection.find()
    .merge(query)
    .countDocuments();

  const skip = (page - 1) * perPage;
  const data = await query
    .skip(skip)
    .limit(perPage)
    .sort({ [sortBy]: sortOrder });

  const paginationData = calculatePaginationData({ totalItems, page, perPage });

  return {
    data,
    ...paginationData,
  };
};

// export const getContactById = (id) => ContactCollection.findById(id);
export const getContactById = ({ id, userId }) =>
  ContactCollection.findOne({ _id: id, userId });

export const addContact = (payload) => ContactCollection.create(payload);

// export const addContact = async (payload) => {
//   console.log('addContact called with payload:', payload); // Лог для вхідних даних

//   const result = await ContactCollection.create(payload);

//   console.log('addContact result:', result); // Лог для результату створення
//   return result;
// };

export const updateContact = async ({
  _id,
  userId,
  payload,

  options = {},
}) => {
  const rawResult = await ContactCollection.findOneAndUpdate(
    { _id, userId },
    payload,

    {
      ...options,
      new: true,
      includeResultMetadata: true,
    },
  );

  if (!rawResult || !rawResult.value) return null;

  return {
    data: rawResult.value,
    isNew: Boolean(rawResult.lastErrorObject.upserted),
  };
};

// export const deleteContact = (filter) => ContactCollection.findOneAndDelete(filter);
export const deleteContact = ({ _id, userId }) =>
  ContactCollection.findOneAndDelete({ _id, userId });
