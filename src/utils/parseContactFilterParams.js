import { typeList } from '../constants/contacts.js';

export const parseContactFilterParams = (query) => {
  const { type, isFavourite } = query;
  const filter = {};

  // Перевірка параметра `type`
  if (type && typeList.includes(type)) {
    filter.contactType = type;
  }

  // Перевірка параметра `isFavourite`
  if (isFavourite === 'true') {
    filter.isFavourite = true;
  } else if (isFavourite === 'false') {
    filter.isFavourite = false;
  }

  return filter;
};
