export const successResponse = (data, message = "Success") => ({
  status: "success",
  message,
  data,
});

export const errorResponse = (message, errors = null) => ({
  status: "error",
  message,
  ...(errors && { errors }),
});

export const paginatedResponse = (data, pagination) => ({
  status: "success",
  data,
  pagination: {
    page: pagination.page,
    limit: pagination.limit,
    total: pagination.total,
    pages: Math.ceil(pagination.total / pagination.limit),
  },
});

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
