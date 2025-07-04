import createHttpError from 'http-errors';
import { isValidObjectId } from 'mongoose';

export const isValidId = (req, res, next) => {
  if (!isValidObjectId(req.params.contactId)) {
    throw createHttpError(400, 'Invalid Id');
  }
  next();
};
