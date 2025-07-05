import {
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
  updateContact,
} from '../services/contacts.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';

export const getAllContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const filters = parseFilterParams(req.query);
  const data = await getAllContacts({
    page,
    perPage,
    sortBy,
    sortOrder,
    filters,
  });

  if (data.data.length < 1) {
    return res.json({
      status: 200,
      message: 'No contacts found!',
      data,
    });
  }
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data,
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId);

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  const contact = await createContact(req.body);

  res.status(201).json({
    status: 201,
    message: `Successfully created a contact!`,
    data: contact,
  });
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const { contact } = await updateContact(contactId, req.body);

  res.json({
    status: 200,
    message: `Successfully patched a contact!`,
    data: contact,
  });
};

export const upsertContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const { contact, isNew } = await updateContact(contactId, req.body, {
    upsert: true,
  });

  const status = isNew ? 201 : 200;

  res.status(status).json({
    status,
    message: isNew
      ? 'Successfully created a contact!'
      : 'Successfully patched a contact!',
    data: contact,
  });
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;
  await deleteContact(contactId);

  res.status(204).send();
};
