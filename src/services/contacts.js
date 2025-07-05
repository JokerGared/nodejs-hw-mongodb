import createHttpError from 'http-errors';
import { ContactsCollection } from '../db/models/contact.js';
import { calculatePaginationData } from '../utils/calculatePaginationData.js';
import { FILTER_BY } from '../constants/filterBy.js';

export const getAllContacts = async ({
  page,
  perPage,
  sortBy,
  sortOrder,
  filters,
}) => {
  if (page < 1 || perPage < 1) {
    throw createHttpError(
      400,
      'Page and perPage value must be at least 1 or higher',
    );
  }

  const offset = (page - 1) * perPage;

  const contactsFilter = ContactsCollection.find();

  if (filters.type) {
    contactsFilter.where(FILTER_BY.TYPE).equals(filters.type);
  }
  if (typeof filters.isFavourite === 'boolean') {
    contactsFilter.where(FILTER_BY.IS_FAVOURITE).equals(filters.isFavourite);
  }

  const [contactsCount, contacts] = await Promise.all([
    ContactsCollection.find().merge(contactsFilter).countDocuments(),
    contactsFilter
      .skip(offset)
      .limit(perPage)
      .sort({ [sortBy]: sortOrder }),
  ]);
  const metadata = calculatePaginationData(page, perPage, contactsCount);
  return { data: contacts, ...metadata };
};

export const getContactById = async (contactId) => {
  const contact = await ContactsCollection.findById(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
  return contact;
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, payload, options = {}) => {
  const result = await ContactsCollection.findByIdAndUpdate(
    contactId,
    payload,
    {
      new: true,
      includeResultMetadata: true,
      ...options,
    },
  );
  console.log(result);

  if (!result.value) {
    throw createHttpError(404, 'Contact not found');
  }
  return {
    contact: result.value,
    isNew: !result.lastErrorObject.updatedExisting,
  };
};

export const deleteContact = async (contactId) => {
  const contact = await ContactsCollection.findByIdAndDelete(contactId);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }
};
