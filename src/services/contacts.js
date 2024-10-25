import ContactCollection from '../db/models/Contact.js';

// export const getContacts = () => ContactCollection.find();

// export const getContactById = (id) => ContactCollection.findById(id);

export const getContacts = async () => {
  const contacts = await ContactCollection.find();
  return contacts;
};

export const getContactById = async (id) => {
  const contact = await ContactCollection.findById(id);
  return contact;
};
