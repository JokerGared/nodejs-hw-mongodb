import { CONTACT_TYPES } from '../constants/contactTypes.js';

export const parseFilterParams = ({ type, isFavourite }) => {
  return {
    type: parseType(type),
    isFavourite: parseBoolean(isFavourite),
  };
};

const parseType = (value) => {
  if (Object.values(CONTACT_TYPES).includes(value)) {
    return value;
  }
};

const parseBoolean = (value) => {
  if (['true', 'false'].includes(value)) {
    return JSON.parse(value);
  }
};
