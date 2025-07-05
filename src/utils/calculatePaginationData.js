import createHttpError from 'http-errors';

export const calculatePaginationData = (page, perPage, count) => {
  const totalPages = Math.ceil(count / perPage);

  if (page > totalPages && totalPages > 0) {
    throw createHttpError(
      400,
      `Page value exceeds the total page count: ${totalPages}`,
    );
  }

  const hasNextPage = totalPages > page;
  const hasPreviousPage = page !== 1 && +page <= totalPages;
  return {
    page,
    perPage,
    totalItems: count,
    totalPages,
    hasPreviousPage,
    hasNextPage,
  };
};
