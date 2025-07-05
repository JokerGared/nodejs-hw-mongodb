import { SORT_BY } from '../constants/sortBy.js';
import { SORT_ORDER } from '../constants/sortOrder.js';

export const parseSortOrder = (value) => {
  if ([SORT_ORDER.ASC, SORT_ORDER.DESC].includes(value)) {
    return value;
  }
  return SORT_ORDER.ASC;
};

export const parseSortBy = (value) => {
  if ([SORT_BY.EMAIL, SORT_BY.NAME, SORT_BY.PHONE].includes(value)) {
    return value;
  }
  return '_id';
};

export const parseSortParams = (query) => {
  return {
    sortOrder: parseSortOrder(query.sortOrder),
    sortBy: parseSortBy(query.sortBy),
  };
};
