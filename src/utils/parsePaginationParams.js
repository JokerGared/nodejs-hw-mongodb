export const parsePaginationParams = ({ page, perPage }) => {
  return {
    page: parseNumber(page, 1),
    perPage: parseNumber(perPage, 10),
  };
};

const parseNumber = (value, defaultValue) => {
  const isString = typeof value === 'string';
  if (!isString) return defaultValue;

  const parsedNumber = parseInt(value);
  if (Number.isNaN(parsedNumber)) {
    return defaultValue;
  }

  return parsedNumber;
};
