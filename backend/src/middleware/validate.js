export const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join("."),
      message: d.message,
    }));
    const primaryMessage = errors[0]?.message || "Validation failed";
    return res.status(400).json({ message: primaryMessage, errors });
  }

  req.body = value;
  next();
};
